import type { Task } from '@mindwtr/core';

export function orderFocusedTasksFirst<T extends Pick<Task, 'isFocusedToday'>>(tasks: T[]): T[] {
    if (tasks.length < 2) return tasks;

    const focusedTasks: T[] = [];
    const otherTasks: T[] = [];

    tasks.forEach((task) => {
        if (task.isFocusedToday) {
            focusedTasks.push(task);
            return;
        }

        otherTasks.push(task);
    });

    if (focusedTasks.length === 0 || otherTasks.length === 0) return tasks;

    return [...focusedTasks, ...otherTasks];
}
