import React, { useEffect, useRef, useState } from "react";
import CollapsedButton from "./CollapsedButton";
import Image from "next/image";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  heatmapShowConnectPPCState,
  stiReportStatusState,
} from "@/atoms/rank-radar";
import { Spin } from "antd";

const NoPPCDataHeaderRenderer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState(0);
  const setShowConnectPpc = useSetRecoilState(heatmapShowConnectPPCState);
  const stiReportStatus = useRecoilValue(stiReportStatusState);
  const [isReportCreated, setIsReportCreated] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const agRoot = containerRef.current.closest(".ag-root");
    setTableHeight(agRoot?.clientHeight || 0);
  }, []);

  const handleClose = () => {
    const nextValue = { isShow: false, lastHideTime: new Date().getTime() };
    setShowConnectPpc(nextValue);
  };

  const renderContent = () => {
    if (stiReportStatus.isLoading) {
      return (
        <div className="flex-1 flex flex-col justify-center items-center -mt-[150px]">
          <Spin />
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col justify-center items-center -mt-[150px]">
        <Image
          src="/assets/icons/no_ppc_data_icon.svg"
          width={64}
          height={64}
          alt="no ppc data"
        />

        <div className="mt-8 font-medium w-[315px] text-black whitespace-normal text-center">
          To make the most of Rank Radar, connect your Amazon PPC account
        </div>

        <div className="text-secondary-6 w-[315px] text-center mt-2 font-regular">
          This will enable you to view additional data <br /> in the table,
          including Impression Share, Impression Rank, CPC, CTR, CVR, <br />
          PPC Sales, and Spend
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="cursor-auto">
      <CollapsedButton />
      {tableHeight && (
        <div
          className="w-[400px] absolute top-0 p-4 flex flex-col"
          style={{ height: tableHeight }}
        >
          <div className="bg-[#E9F2FF] flex-1 flex flex-col p-3 rounded-lg text-[14px] leading-[20px] whitespace-normal">
            <div className="flex justify-end" onClick={handleClose}>
              <Image
                className="cursor-pointer"
                src="/assets/icons/close_icon.svg"
                alt="close"
                width={24}
                height={24}
              />
            </div>

            {renderContent()}
          </div>
        </div>
      )}
      <div />
    </div>
  );
};

export default NoPPCDataHeaderRenderer;
