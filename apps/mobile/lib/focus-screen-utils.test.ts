import { describe, expect, it } from 'vitest';

import { orderFocusedTasksFirst } from './focus-screen-utils';

describe('orderFocusedTasksFirst', () => {
    it('moves focused tasks to the top while preserving relative order inside each group', () => {
        const ordered = orderFocusedTasksFirst([
            { id: 'due-1', isFocusedToday: false },
            { id: 'focus-1', isFocusedToday: true },
            { id: 'due-2', isFocusedToday: false },
            { id: 'focus-2', isFocusedToday: true },
            { id: 'focus-3', isFocusedToday: true },
        ]);

        expect(ordered.map((task) => task.id)).toEqual([
            'focus-1',
            'focus-2',
            'focus-3',
            'due-1',
            'due-2',
        ]);
    });

    it('returns the original ordering when there are no non-focused tasks to move below', () => {
        const tasks = [
            { id: 'focus-1', isFocusedToday: true },
            { id: 'focus-2', isFocusedToday: true },
        ];

        expect(orderFocusedTasksFirst(tasks)).toBe(tasks);
    });
});
