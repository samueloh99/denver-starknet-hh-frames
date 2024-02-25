import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";

export default function RootPage({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="bg-black min-h-screen h-full flex justify-center items-center">
      <h1>Cairo Quiz on Frame</h1>
    </div>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return {
    props: { data: "data" },
  };
};
