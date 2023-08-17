import React, { useMemo } from "react"
import { useRecoilValue } from "recoil"
import { cellBorderSelector } from "../selectors/rank-radar"
import classNames from "classnames"

interface GapFillingDateProps {
  date: string
  kwId: string
  ignoreTopBorder?: boolean
  ignoreBottomBorder?: boolean
  className?: string
}

const GapFillingDate = ({
  date,
  kwId,
  ignoreBottomBorder,
  ignoreTopBorder,
}: GapFillingDateProps) => {
  const borders = useRecoilValue(cellBorderSelector(`${kwId}_${date}`))

  const borderStyles = useMemo(() => {
    const styles: Record<string, string> = {}
    if (borders.top && !ignoreTopBorder) {
      styles.borderTop = `2px solid ${borders.top}`
    }
    if (borders.bottom && !ignoreBottomBorder) {
      styles.borderBottom = `2px solid ${borders.bottom}`
    }
    if (borders.left) {
      styles.borderLeft = `2px solid ${borders.left}`
    }
    if (borders.right) {
      styles.borderRight = `2px solid ${borders.right}`
    }

    return styles
  }, [borders, ignoreBottomBorder, ignoreTopBorder])

  const shouldNotRoundedLeft = borders.top && !borders.left
  const shouldNotRoundedRight = borders.top && !borders.right
  const shouldNotRoundedBottom =
    (ignoreBottomBorder && borders.left) ||
    (ignoreBottomBorder && borders.right)
  const shouldNotRoundedTop =
    (ignoreTopBorder && borders.left) || (ignoreTopBorder && borders.right)

  return (
    <div
      style={borderStyles}
      className={classNames(
        "h-full w-[36px] rounded-[3px]",
        shouldNotRoundedLeft && "rounded-l-none",
        shouldNotRoundedRight && "rounded-r-none",
        shouldNotRoundedBottom && "rounded-b-none",
        shouldNotRoundedTop && "rounded-t-none",
        !borders.right && "flex-1"
      )}
    />
  )
}

export default GapFillingDate
