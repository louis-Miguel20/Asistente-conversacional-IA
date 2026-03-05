import { describe, it, expect } from 'vitest'
import { formatContext } from './context'
import { Document } from "langchain/document";

describe('Context Utility', () => {
  it('should format documents correctly', () => {
    const docs = [
      new Document({ 
        pageContent: 'Test content',
        metadata: { source: 'test.pdf', page: 1 }
      })
    ];

    const result = formatContext(docs);
    
    expect(result.text).toContain('<content>\nTest content\n</content>');
    expect(result.text).toContain('Source: test.pdf');
    expect(result.sources).toEqual(['test.pdf']);
  });

  it('should handle empty documents', () => {
    const result = formatContext([]);
    expect(result.text).toBe('');
    expect(result.sources).toEqual([]);
  });
});
