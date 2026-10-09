import { describe, expect, it } from 'vitest';
import {
    getCourseDomain,
    getCourseInitials,
    getCourseProgress,
    normalizeHours,
    parseCourseLabels,
} from './courseUtils';

describe('course utilities', () => {
    it('normalizes hours to a positive whole number', () => {
        expect(normalizeHours('2.2')).toBe(3);
        expect(normalizeHours('-100')).toBe(1);
        expect(normalizeHours('not a number')).toBe(1);
    });

    it('uses legacy completion when a progress percentage is missing', () => {
        expect(getCourseProgress({ completed: true })).toBe(100);
        expect(getCourseProgress({ completed: false })).toBe(0);
        expect(getCourseProgress({ completed: false, progress: 35 })).toBe(35);
    });

    it('formats course titles and domains for compact display', () => {
        expect(getCourseInitials('Advanced TypeScript Patterns')).toBe('AT');
        expect(getCourseInitials('')).toBe('LC');
        expect(getCourseDomain('https://www.example.com/path')).toBe('example.com');
        expect(getCourseDomain('')).toBe('No link provided');
    });

    it('parses comma-separated labels and removes empty entries', () => {
        expect(parseCourseLabels(' React, SQL ,, Node.js ')).toEqual(['React', 'SQL', 'Node.js']);
    });
});