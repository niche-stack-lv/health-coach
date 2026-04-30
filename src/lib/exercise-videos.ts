// YouTube video IDs for exercise demos
export const exerciseVideos: Record<string, string> = {
  "Flat Bench Press": "rT7DgCr-3pg",
  "Incline Dumbbell Press": "8iPEnn-ltC8",
  "Cable Flyes": "Iwe6AmxVf7o",
  "Dips (Chest)": "2z8JmcrW-As",
  "Pec Deck Machine": "Z57CtFmRMxA",
  "Deadlift": "op9kVnSso6Q",
  "Lat Pulldown": "CAwf7n6Luuc",
  "Barbell Row": "FWJR5Ve8bnQ",
  "Seated Cable Row": "GZbfZ033f74",
  "Pull-ups": "eGo4IYlbE5g",
  "Overhead Press": "2yjwXTZQDDI",
  "Lateral Raises": "3VcKaXpzqRo",
  "Face Pulls": "rep-qVOkqgk",
  "Front Raises": "-t7fuZ0KhDA",
  "Rear Delt Flyes": "EA7u4Q_8HQ0",
  "Barbell Curl": "kwG2ipFRgFo",
  "Hammer Curls": "zC3nLlEvin4",
  "Tricep Pushdown": "2-LAMcpzODU",
  "Skull Crushers": "d_KZxkY_0cM",
  "Preacher Curl": "fIWP-FRFNU0",
  "Barbell Squat": "ultWZbUMPL8",
  "Leg Press": "IZxyjW7MPJQ",
  "Romanian Deadlift": "7j-2w4-P14I",
  "Leg Extension": "YyvSfVjQeL0",
  "Leg Curl": "1Tq3QdYUuHs",
  "Calf Raises": "gwLzBJYoWlI",
  "Bulgarian Split Squat": "2C-uNgKwPLE",
  "Hanging Leg Raise": "hdng3Nm1x_E",
  "Cable Crunch": "AV5PmrIVoLk",
  "Plank": "ASdvN_XEl_c",
  "Treadmill Walk": "njeZ29umqVE",
  "Stairmaster": "VCBbxjwSboQ",
  "Cycling": "0lPMwLBCMGo",
};

export function getVideoUrl(exerciseName: string): string | null {
  const id = exerciseVideos[exerciseName];
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}

export function getVideoThumbnail(exerciseName: string): string | null {
  const id = exerciseVideos[exerciseName];
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}
