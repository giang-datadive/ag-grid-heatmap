import React from "react"
import CollapsedButton from "./CollapsedButton"
import { useRecoilValue } from "recoil"
import {
  hasPPCDataSelector,
  showConnectPPCSelector,
} from "@/selectors/rank-radar"

const RelevancyHeaderRenderer = () => {
  const hasPPCData = useRecoilValue(hasPPCDataSelector)
  const isShowConnectPPC = useRecoilValue(showConnectPPCSelector)

  return (
    <div className="text-[14px] text-black">
      Rel.
      {!isShowConnectPPC && !hasPPCData && <CollapsedButton />}
    </div>
  )
}

export default RelevancyHeaderRenderer
