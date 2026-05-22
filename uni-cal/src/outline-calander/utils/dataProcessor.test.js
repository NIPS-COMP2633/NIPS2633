import { parseAIJSONResponse } from './dataProcessor';

describe('parseAIJSONResponse', () => {
  it('parses a JSON array with leading and trailing prose', () => {
    const response = `sure, here is the json:
[
  {"summary":"Midterm","description":"Exam"}
]
Thanks!`;

    expect(parseAIJSONResponse(response)).toEqual([
      { summary: 'Midterm', description: 'Exam' }
    ]);
  });

  it('parses a JSON object with leading and trailing prose', () => {
    const response = 'Here you go: {"summary":"Quiz"} done';

    expect(parseAIJSONResponse(response)).toEqual({ summary: 'Quiz' });
  });

  it('returns null when no JSON payload is present', () => {
    expect(parseAIJSONResponse('No events found')).toBeNull();
  });
});
