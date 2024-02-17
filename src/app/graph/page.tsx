import { Button } from "@/components/ui/button";
import Link from "next/link";
import arrowRightBlackPic from "@/assets/common/arrow_right_black.svg";
import shareIconPic from "@/assets/common/share_icon.svg";
import Image from "../../../node_modules/next/image.d";
import GraphChart from "@/components/pages/GraphChart";
import { envConfig } from "@/lib/envConfig";

export default async function Page({
  searchParams,
}: {
  searchParams: { highlight_id: string };
}) {
  return (
    <main className="flex w-full max-w-screen-sm flex-1 flex-col content-between px-4 pb-4 pt-8">
      <div className="text-5xl font-medium text-white">Onchain Chronicles</div>
      <GraphChart
        className="my-4 grow"
        highlightId={searchParams.highlight_id}
      />
      <Button asChild className="shadow-2xl">
        <Link href="/chapters">
          {searchParams.highlight_id ? (
            <>Continue Another Story</>
          ) : (
            <>
              Continue a Story{" "}
              <Image
                className="ml-2.5"
                src={arrowRightBlackPic}
                alt={"Button Icon"}
              />
            </>
          )}
        </Link>
      </Button>
      {searchParams.highlight_id ? (
        <Button asChild className="mb-24 mt-4">
          <a
            className="flex"
            target="_blank"
            href={envConfig.LEARN_STORY_PROTOCOL_LINK || ""}
          >
            Learn About Story Protocol{" "}
            <Image className="ml-2.5" src={shareIconPic} alt={"Blank Icon"} />
          </a>
        </Button>
      ) : (
        <></>
      )}
    </main>
  );
}
