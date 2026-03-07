import { beforeEach, describe, expect, it, vi } from 'vitest';

const fileSystemMock = vi.hoisted(() => ({
  __esModule: true,
  documentDirectory: 'file://document/',
  cacheDirectory: 'file://cache/',
  StorageAccessFramework: {
    readDirectoryAsync: vi.fn().mockResolvedValue([]),
    makeDirectoryAsync: vi.fn().mockResolvedValue('content://attachments'),
    createFileAsync: vi.fn().mockResolvedValue('content://attachments/file'),
    readAsStringAsync: vi.fn().mockResolvedValue(''),
    writeAsStringAsync: vi.fn().mockResolvedValue(undefined),
  },
  EncodingType: {
    Base64: 'base64',
  },
  getInfoAsync: vi.fn(),
  makeDirectoryAsync: vi.fn().mockResolvedValue(undefined),
  readAsStringAsync: vi.fn(),
  writeAsStringAsync: vi.fn().mockResolvedValue(undefined),
  readDirectoryAsync: vi.fn().mockResolvedValue([]),
  deleteAsync: vi.fn().mockResolvedValue(undefined),
  copyAsync: vi.fn().mockResolvedValue(undefined),
  moveAsync: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('expo-file-system/legacy', () => fileSystemMock);

vi.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@mindwtr/core', () => ({
  validateAttachmentForUpload: vi.fn().mockResolvedValue({ valid: true }),
  cloudGetFile: vi.fn(),
  cloudPutFile: vi.fn(),
  computeSha256Hex: vi.fn().mockResolvedValue(null),
  globalProgressTracker: {
    updateProgress: vi.fn(),
  },
  webdavGetFile: vi.fn(),
  webdavFileExists: vi.fn(),
  webdavMakeDirectory: vi.fn(),
  webdavPutFile: vi.fn(),
  withRetry: vi.fn(async (fn: () => Promise<unknown>) => await fn()),
  createWebdavDownloadBackoff: vi.fn(() => ({
    getBlockedUntil: vi.fn().mockReturnValue(null),
    setFromError: vi.fn(),
    prune: vi.fn(),
    deleteEntry: vi.fn(),
  })),
  isWebdavRateLimitedError: vi.fn().mockReturnValue(false),
  getErrorStatus: vi.fn().mockReturnValue(undefined),
}));

vi.mock('./dropbox-sync', () => ({
  DropboxFileNotFoundError: class DropboxFileNotFoundError extends Error {},
  DropboxUnauthorizedError: class DropboxUnauthorizedError extends Error {},
  downloadDropboxFile: vi.fn(),
  uploadDropboxFile: vi.fn(),
}));

vi.mock('./app-log', () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  sanitizeLogMessage: (value: string) => value,
}));

describe('attachment sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fileSystemMock.makeDirectoryAsync.mockResolvedValue(undefined);
    fileSystemMock.copyAsync.mockResolvedValue(undefined);
    fileSystemMock.moveAsync.mockResolvedValue(undefined);
    fileSystemMock.writeAsStringAsync.mockResolvedValue(undefined);
    fileSystemMock.deleteAsync.mockResolvedValue(undefined);
  });

  it('persists generic Android content uris by staging them to a temp file first', async () => {
    const contentUri = 'content://com.android.providers.downloads.documents/document/msf%3A1000006030';
    fileSystemMock.getInfoAsync
      .mockResolvedValueOnce({ exists: false })
      .mockResolvedValueOnce({ exists: true, size: 3 });
    fileSystemMock.readAsStringAsync
      .mockRejectedValueOnce(new Error(`Unsupported scheme for location '${contentUri}'.`))
      .mockResolvedValueOnce('AQID');

    const { persistAttachmentLocally } = await import('./attachment-sync');

    const result = await persistAttachmentLocally({
      id: 'att-1',
      kind: 'file',
      title: 'Embosser.png',
      uri: contentUri,
      createdAt: '2026-03-06T05:14:32.399Z',
      updatedAt: '2026-03-06T05:14:32.399Z',
    });

    expect(fileSystemMock.copyAsync).toHaveBeenCalledTimes(1);
    expect(fileSystemMock.copyAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        from: contentUri,
        to: expect.stringMatching(/^file:\/\/cache\/content-read-/),
      })
    );
    expect(fileSystemMock.deleteAsync).toHaveBeenCalledWith(
      expect.stringMatching(/^file:\/\/cache\/content-read-/),
      { idempotent: true }
    );
    expect(result.uri).toBe('file://document/attachments/att-1.png');
    expect(result.localStatus).toBe('available');
    expect(result.size).toBe(3);
  });
});
