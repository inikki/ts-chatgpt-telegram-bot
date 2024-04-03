export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function* collectChunksForDuration(
  stream: string | AsyncIterable<string> | never[],
  durationMs: number,
): AsyncGenerator<string> {
  const startTime = Date.now();

  let currentDuration = 0;
  let currentChunk: string[] = [];

  for await (const chunk of stream) {
    currentChunk.push(chunk);

    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;

    if (elapsedTime >= currentDuration + durationMs) {
      yield currentChunk[currentChunk.length - 1];
      currentChunk = [];
      currentDuration = elapsedTime;
    }
  }

  // Yield the remaining chunk if any
  if (currentChunk.length > 0) {
    yield currentChunk[currentChunk.length - 1];
  }
}
