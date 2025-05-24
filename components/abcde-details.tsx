interface ABCDEDetailsProps {
  abcdeResults: any; // Using any for simplicity, but you can define a proper type
}

export function ABCDEDetails({ abcdeResults }: ABCDEDetailsProps) {
  const criteriaItems = [
    {
      letter: "A",
      name: "Asymmetry",
      flag: abcdeResults.asymmetry,
      score: abcdeResults.asymmetryScore,
      description: "One half of the lesion doesn't match the other half",
    },
    {
      letter: "B",
      name: "Border",
      flag: abcdeResults.border,
      score: abcdeResults.borderScore,
      description: "Edges are irregular, ragged, notched, or blurred",
    },
    {
      letter: "C",
      name: "Color",
      flag: abcdeResults.color,
      score: abcdeResults.colorScore,
      description: "Color is not uniform and may include different shades",
    },
    {
      letter: "D",
      name: "Diameter",
      flag: abcdeResults.diameter,
      value: abcdeResults.diameterValue,
      description: "Larger than 6mm (about the size of a pencil eraser)",
    },
    {
      letter: "E",
      name: "Evolution",
      flag: abcdeResults.evolution,
      description: "The lesion has changed over time",
      notes: abcdeResults.evolutionNotes,
    },
  ];

  return (
    <div>
      <h4 className="font-medium mb-2">ABCDE Analysis</h4>
      <div className="space-y-3">
        {criteriaItems.map((item) => (
          <div key={item.letter} className="flex items-start gap-3">
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                item.flag
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {item.letter}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.name}</span>
                {item.score !== undefined && (
                  <div className="ml-auto text-xs">
                    Score: {(item.score * 100).toFixed(0)}%
                  </div>
                )}
                {item.value !== undefined && (
                  <div className="ml-auto text-xs">{item.value} mm</div>
                )}
              </div>
              <p className="text-xs text-gray-500">{item.description}</p>
              {item.notes && (
                <p className="text-xs text-gray-700 mt-1">{item.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-500">
        Total flags: {abcdeResults.totalFlags}/5
      </div>
    </div>
  );
}
