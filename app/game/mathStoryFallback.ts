export function buildLocalMathStory(
  num1: number,
  num2: number,
  operator: string
): string {
  if (operator === "-" || operator === "subtraction") {
    return `Nyckelpigan hade ${num1} stjärnor. Hon gav bort ${num2}. Hur många stjärnor har hon kvar?`;
  }

  return `Nyckelpigan hade ${num1} stjärnor. Hon hittade ${num2} till. Hur många stjärnor har hon nu?`;
}
