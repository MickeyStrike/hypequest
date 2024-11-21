"use client"
import { CSSProperties, FC, useEffect, useMemo, useState } from "react";
import styles from "@/styles/components/reusables/CountdownCircle.module.css"
import { DateTime } from "luxon";
import { timeAgo } from "@/helper";
import { useGlobalContext } from "@/providers/stores";

export interface MyCustomCSS extends CSSProperties {
  '--clr': string;
  '--stroke-dasharray': number;
  '--stroke-dashoffset': number;
}

export interface CountdownCircleProps {
  startDate: string | Date;
  endDate: string | Date;
}

const CountdownCircle: FC<CountdownCircleProps> = (props) => {
  const { state: { isLight } } = useGlobalContext()
  const [bindInterval, setBindInterval] = useState<NodeJS.Timer | null>(null)
  const [diffDate, setDiffDate] = useState<string | null>(null)
  const numerator = new Date().valueOf() - new Date(props.startDate).valueOf()
  const denominator = new Date(props.endDate).valueOf() - new Date(props.startDate).valueOf()

  const circleAngle = numerator/denominator * 360
  const dashOffset = numerator/denominator * 220

  useEffect(()=>{
    setBindInterval(setInterval(() => {
      setDiffDate(timeAgo(DateTime.fromJSDate(new Date(props.endDate))))
    }, 1000))

    return () => clearInterval((bindInterval ?? undefined) as number | undefined)
  }, [props.endDate])

  const choosedColor = useMemo(() => {
    if(circleAngle > 270) return '#C77BFF'
    else if(circleAngle > 180) return '#C77BFF'
    return '#C77BFF'
  }, [circleAngle])

  return (
    <div className={styles["countdown-circle"]}>
      <div className={styles["circle"]} style={{'--clr':choosedColor} as MyCustomCSS}>
        <div className={styles["dots"]} style={{transform: `rotateZ(${circleAngle}deg)`}} />
        <svg>
          {[...Array(2).keys()].map(value =>
            <circle 
              key={value}
              cx="35" 
              cy="35" 
              r="35" 
              style={{
                '--stroke-dasharray': 220,
                '--stroke-dashoffset': 220 - dashOffset
              } as MyCustomCSS}
            />
          )}
        </svg>
        <div className={`${styles["label"]} ${isLight ? "text-black" : "text-white"}`}>{diffDate}</div>
      </div>
    </div>
  )
}

export default CountdownCircle