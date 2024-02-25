import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

import { z } from "zod";

export const runtime = "edge";

const schema = z.object({
  v: z.number(),
  state: z.union([
    z.object({
      type: z.literal("intro"),
      name: z.string().optional(),
    }),
    z.object({
      type: z.literal("question"),
      imageURL: z.string(),
      answers: z.array(z.string()).length(4),
      selection: z
        .object({
          selected: z.number(),
          correct: z.number(),
        })
        .nullable(),
    }),
    z.object({
      type: z.literal("result"),
      win: z.boolean(),
      totalQuestions: z.number(),
      correctAnswers: z.number(),
      wrongAnswers: z.number(),
    }),
  ]),
});

export type Props = z.infer<typeof schema>;

export const ImageData = {
  serialize: (props: z.infer<typeof schema>) =>
    Buffer.from(JSON.stringify(props)).toString("base64url"),
  parse: (props: any) =>
    schema.parse(JSON.parse(Buffer.from(props, "base64url").toString("utf8"))),
};

function Screen(props: Props) {
  if (props.state.type === "intro") {
    return (
      <div tw="relative bg-black w-full h-full flex flex-col items-center justify-center bg-stone-800">
        <div style={{ fontSize: 100, color: "white" }}>
          {props.state.name ?? "Quiz"}
        </div>
      </div>
    );
  }

  if (props.state.type === "result") {
    return (
      <div tw="relative bg-black w-full h-full flex flex-col items-center justify-center bg-stone-800">
        <h1 style={{ fontSize: 50, color: "white" }}>
          Correct: {props.state.correctAnswers}/{props.state.totalQuestions}
        </h1>
        <h1 style={{ fontSize: 50, color: "white" }}>
          Wrong: {props.state.wrongAnswers}
        </h1>
        {
          <h1 style={{ fontSize: 50, color: "white" }}>
            {props.state.win ? "You are genius!" : "Failed!"}
          </h1>
        }
      </div>
    );
  }

  if (props.state.selection !== null) {
    return (
      <div tw="relative bg-black w-full h-full flex flex-col items-center justify-center bg-stone-800">
        <div tw="flex flex-col justify-center items-center">
          {props.state.selection.selected === props.state.selection.correct ? (
            <h1 tw="text-green-600">CORRECT!</h1>
          ) : (
            <h1 tw="text-red-600">WRONG!</h1>
          )}
          <div tw="flex flex-row justify-center items-center">
            <h1 tw="pr-5 text-white">Answer is</h1>
            <h1 tw="text-green-600">
              {props.state.answers[props.state.selection.correct]}
            </h1>
          </div>
          <div tw="flex flex-row justify-center items-center">
            <h1 tw="pr-5 text-white"> Your answer was:</h1>
            <h1 tw="text-white">
              {props.state.answers[props.state.selection.selected]}
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div tw="relative bg-black w-full h-full flex flex-col items-start justify-start bg-stone-800">
      <img src={props.state.imageURL} tw="absolute w-full h-full" />
    </div>
  );
}

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const props = ImageData.parse(searchParams.get("props"));

  return new ImageResponse(<Screen {...props} />, {
    width: 1200,
    height: 630,
  });
}
