import { BaseExportParams, IToolPanelParams } from "ag-grid-community";
import { useEffect, useRef, useState } from "react";
import { processCellForExportWithFormattedValue } from "./helpers";
import { Button, Popover, Select } from "antd";
import { toast } from "react-toastify";
import CustomNextImage from "next/image";
export interface AgExportToolPanelProps extends Partial<IToolPanelParams> {
  fileName?: string;
  processCellCallback?: BaseExportParams["processCellCallback"];
  exportMessage?: string;
  asins?: string[];
}

export const AgExportFileNameMaker = () =>
  window.location.pathname.replace(/^\//, "").replaceAll("/", "-");

const AgExportToolPanel = ({
  api,
  fileName,
  processCellCallback,
  exportMessage,
  asins,
}: AgExportToolPanelProps) => {
  const [exportTarget, setExportTarget] = useState("csv");
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current);
    };
  }, []);

  const onExport = () => {
    const exportOptions = {
      fileName: fileName || AgExportFileNameMaker(),
      processCellCallback:
        processCellCallback || processCellForExportWithFormattedValue,
    };

    if (!api) return;

    if (exportTarget === "csv") {
      api.exportDataAsCsv(exportOptions);
    } else {
      api.exportDataAsExcel(exportOptions);
    }
  };

  const handleCopy = async () => {
    try {
      if (!asins) return;
      await navigator.clipboard.writeText(asins.join(" "));
      timeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 3000);
      setIsCopied(true);
    } catch (e) {
      toast.error("Failed to copy!");
    }
  };

  return (
    <div className="py-4 px-3">
      <h5 className="text-xs mb-[2px]">{exportMessage || "Export as"}</h5>
      <Select
        value={exportTarget}
        onChange={(value) => setExportTarget(`${value}`)}
        options={[
          { label: "CSV", value: "csv" },
          { label: "Excel", value: "excel" },
        ]}
        className="bg-white mt-2"
      />
      <div className="flex flex-col items-center gap-2">
        <Button type="primary" className="mt-2 w-full" onClick={onExport}>
          Export
        </Button>

        {asins && asins.length > 0 && (
          <Popover
            arrow={false}
            open={isCopied}
            content={<span className="text-white">Copied to clipboard</span>}
            title={null}
            color="black"
            trigger="click"
            overlayInnerStyle={{
              padding: "6px 8px",
              color: "white",
            }}
          >
            <div
              onClick={handleCopy}
              className="flex gap-1 cursor-pointer text-primary mt-4 whitespace-nowrap font-medium font-sans"
            >
              <div className="shrink-0 font-sans">
                <CustomNextImage
                  src="/assets/icons/copy_icon.svg"
                  width={16}
                  height={16}
                  alt="copy"
                />
              </div>
              Copy ASINs to clipboard
            </div>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default AgExportToolPanel;
