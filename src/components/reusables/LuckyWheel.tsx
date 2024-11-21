// "use client"
// import React, { ReactNode, useRef, useEffect, Fragment, DependencyList } from "react";
// import { animated, useSpring } from "@react-spring/web";
// import { randomIntFromInterval, useMinimizedState } from "@/helper";
// import { ThemeModal } from "@/components/reusables/NextuiTheme";
// import Image from "next/image"
// import { useLottie } from "lottie-react";
// import sprinklesAnimation from "@/components/animations/sprinkles.json"
// import { TwitterXIcon } from "../assets/icons";
// import { ModalBody, ModalContent, useDisclosure } from "@nextui-org/react";
// import styles from "@/styles/components/reusables/LuckyWheel.module.css"

// const map = function (value: number, in_min: number, in_max: number, out_min: number, out_max: number) {
//   if (value === 0) {
//     return out_min;
//   }
//   return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
// };

// const inverseMap = (angle: number, in_min: number, in_max: number, out_min: number, out_max: number) => {
//   return angle * (((in_max - in_min) + out_min)/(out_max - out_min)) + in_min
// }

// export interface LuckyWheelItem<T> {
//   value: string;
//   item: T;
// }

// export type LuckyWheelFooter = (callback: (selectedValues: Array<string>) => void, isFinishedSpin: boolean) => ReactNode;

// export type LuckyWheelCustomRender = (main: ReactNode, callback: (selectedValues: Array<string>) => void, isFinishedSpin: boolean) => ReactNode

// export interface LuckyWheelProps<T> {
//   items: Array<LuckyWheelItem<T>>;
//   renderItem: (item: LuckyWheelItem<T>, index: number) => ReactNode;
//   onSpin: (callback: (selectedValues: Array<string>) => void) => void;
//   onReSpin: (callback: (selectedValue: string) => void) => void;
//   onReSpinBefore?: () => void;
//   onFinish: (selectedValue: string) => void;
//   footer?: LuckyWheelFooter;
//   loading?: boolean;
//   customRenderer?: LuckyWheelCustomRender;
//   depedencyList?: DependencyList;
// }

// interface RewardModalType<T> {
//   type: "RESPIN" | "CONTINUE";
//   currentReward: T;
//   onClick: () => void;
//   onSpinAgainClick?: () => void;
// }

// interface InitialState<T> {
//   acc: number;
//   angle: number;
//   spinBtnWidth: number;
//   spinBtnHeight: number;
//   finished: boolean;
//   modalType?: RewardModalType<T>;
//   loopAnimation: boolean;
//   circleRadius: number;
//   innerWidth: number;
// }

// const LuckyWheel = <T extends object>(props: LuckyWheelProps<T>) => {
//   const spinBtn = useRef<HTMLButtonElement>(null)
//   const mainRef = useRef<HTMLDivElement>(null)

//   const [state,dispatch] = useMinimizedState<InitialState<T>>({
//     acc: 0,
//     angle: 0,
//     spinBtnWidth: 149.16,
//     spinBtnHeight: 63,
//     finished: true,
//     loopAnimation: false,
//     circleRadius: 300,
//     innerWidth: 0
//   })
//   const { View } = useLottie({
//     animationData: sprinklesAnimation,
//     loop: state.loopAnimation,
//   })
//   const { isOpen, onOpen, onOpenChange } = useDisclosure({
//     isOpen: !!state.modalType,
//     onChange: (isOpen) => {
//       if(!isOpen && state.modalType?.type === "CONTINUE") dispatch({modalType: undefined})
//     },
//   })
//   const { items, renderItem, onSpin, onFinish, onReSpin, onReSpinBefore } = props
//   const r = state.circleRadius
  
//   const anglePerItem = 360/items.length
//   const halfAngle = anglePerItem/2

//   useEffect(()=>{
//     const listenerCallback = () => {
//       dispatch({
//         circleRadius: mainRef.current?.offsetWidth ? mainRef.current.offsetWidth / 2 : 300,
//         spinBtnWidth: spinBtn.current?.offsetWidth ?? 149.16,
//         spinBtnHeight: spinBtn.current?.offsetHeight ?? 63,
//         innerWidth: window.innerWidth
//       })
//     }

//     listenerCallback()

//     window.addEventListener("resize", () => listenerCallback())

//     return () => window.removeEventListener("resize", () => listenerCallback())
//   }, [mainRef.current, spinBtn.current, ...(props.depedencyList ?? [])])

//   useEffect(()=>{
//     if(state.modalType) {
//       dispatch({loopAnimation: true})
//       setTimeout(()=>dispatch({loopAnimation: false}), 100)
//     }
//   }, [state.modalType])

//   const [springProps, set] = useSpring(() => ({
//     transform: "rotate(0deg)",
//     immediate: false,
//   }))

//   const getMiniCircleCoordinate = (deg: number) => {
//     const radian = deg * Math.PI/180
//     const newR = r - (state.innerWidth < 600 ? 10 : 20)
//     return {
//       x: r + newR * Math.cos(radian),
//       y: r + newR * Math.sin(radian)
//     }
//   }

//   let index = 0

//   const recursiveSpin = (selectedValues: Array<string>, selectedValue: string) => {
//     dispatch({modalType: undefined})

//     const selectedIndex = items.findIndex(i => i.value === selectedValue)
//     const selectedItem = items.find(i => i.value === selectedValue)

//     if(selectedItem && selectedIndex > -1) {
//       const currentAngle = 360 - (state.angle % 360)
//       const targetAngle = randomIntFromInterval(-halfAngle + 1, halfAngle - 1) + (selectedIndex * anglePerItem)
//       const power = inverseMap(360 * randomIntFromInterval(4,7) - targetAngle + currentAngle, 0, 100, 0, 1700)
      
//       set({
//         from: { transform: `rotate(${map(state.acc, 0, 100, 0, 1700)}deg)` },
//         transform: `rotate(${map(state.acc + power, 0, 100, 0, 1700)}deg)`,
//         immediate: false,
//         config: { mass: 50, tension: 200, friction: 200, precision: 0.001 },
//         onStart: (result) => {
//           dispatch({finished: result.finished})
//         },
//         onResolve(result) {
//           dispatch({finished: result.finished})
//           if(result.finished) {
//             const getValues = /rotate\((.*)deg\)/.exec(result.value as unknown as string)
//             const spinAngle = getValues ? 360-(Number(getValues[1]) % 360) : 0
            
//             if(items[Math.floor((spinAngle+halfAngle)/anglePerItem)]?.value) onFinish(items[Math.floor((spinAngle+halfAngle)/anglePerItem)].value)

//             const isRespin = index < selectedValues.length - 1
//             dispatch({
//               modalType: {
//                 type: isRespin ? "RESPIN" : "CONTINUE",
//                 currentReward: selectedItem.item,
//                 onClick: () => {
//                   if(isRespin) {
//                     recursiveSpin(selectedValues, selectedValues[index + 1])
//                     index += 1
//                   }
//                   else {
//                     index = 0
//                     dispatch({modalType: undefined})
//                   }
//                 },
//                 onSpinAgainClick: () => onReSpin((selectedValue) => recursiveSpin([selectedValue], selectedValue))
//               }
//             })
//           }
//         },
//       })
//       dispatch({
//         angle: map(state.acc + power, 0, 100, 0, 1700),
//         acc: state.acc + power
//       })
//     }
//   }

//   const spinHandler = () => {
//     onSpin((selectedValues) => recursiveSpin(selectedValues, selectedValues[index]))
//   }

//   const onReSpinHandler = () => {
//     if(!props.loading && state.modalType?.onSpinAgainClick) {
//       if(onReSpinBefore) onReSpinBefore()
//       state.modalType.onSpinAgainClick()
//     }
//   }

//   const actionBtnRenderer = () => {
//     if(state.modalType?.type === "RESPIN") return (
//       <div className={styles['re-spin']}>
//         <button 
//           className={styles['redeem']}
//           onClick={()=>state.modalType?.onClick()}
//         >
//           Re-Spin
//         </button>
//       </div>
//     )
//     else if(state.modalType?.type === "CONTINUE") return (
//       <div className={styles['re-spin']}>
//         <button 
//           className={`${styles['re-spin-btn']} ${props.loading ? styles['re-spin-loading'] : ''}`}
//           onClick={onReSpinHandler}
//         >
//           {props.loading ? 'Loading ..' : 'Spin Again'}
//         </button>
//       </div>
//     )
//     else return null
//   }

//   const mainRenderer = () => {
//     return (
//       <div ref={mainRef} className={styles['lucky-wheel']}>
//         <div 
//           className={styles['selector-lever']}
//           style={{
//             width: r*2
//           }}
//         >
//           <div className={styles['lever']}/>
//         </div>
//         <svg className={styles['circle-border']} style={{width: r*2, height: r*2}}>
//         <defs>
//           <linearGradient id="gradient-outer" x1="0%" y1="0%" x2="0%" y2="100%">
//             <stop stopColor="#FFF9EF" />
//             <stop offset="6.01%" stopColor="#C497E8" />
//             <stop offset="20.13%" stopColor="#EED9FF" />
//             <stop offset="33.45%" stopColor="#FFF9EF"/>
//             <stop offset="49.18%" stopColor="#D0C3F3"/>
//             <stop offset="66.13%" stopColor="#C898EE"/>
//             <stop offset="83.48%" stopColor="#D0C3F3" />
//             <stop offset="100%" stopColor="#D0C3F3" />
//           </linearGradient>
//           <linearGradient id="gradient-inner" x1="0%" y1="0%" x2="0%" y2="100%">
//             <stop stopColor="#4B4B4B"/>
//             <stop offset="1" stopColor="#3F3F3F"/>
//           </linearGradient>
//           <linearGradient id="mini-circle-red" x1="0%" y1="0%" x2="0%" y2="100%">
//             <stop stopColor="#A96BC0"/>
//             <stop offset="1" stopColor="#A96BC0"/>
//           </linearGradient>
//           <linearGradient id="mini-circle-white" x1="0%" y1="0%" x2="0%" y2="100%">
//             <stop stopColor="#fff"/>
//             <stop offset="1" stopColor="#fff"/>
//           </linearGradient>
//           <linearGradient id="center-layer-back"  x1="12.8697" y1="73.1579" x2="73.1204" y2="12.8925" gradientUnits="userSpaceOnUse">
//             <stop stopColor="#993C0B"/>
//             <stop offset="0.8495" stopColor="#FFE368"/>
//             <stop offset="1" stopColor="#F8C448"/>
//           </linearGradient>
//           <pattern id="center-layer-front" patternUnits="userSpaceOnUse" width="100" height="100">
//             <image href="/lucky_wheel_rectangle.png" x="0" y="0" width="100" height="100" />
//           </pattern>
//         </defs>
//           <circle 
//             className={styles['inner-layer']}
//             cx={r}
//             cy={r}
//             r={r-25}
//             stroke="url(#gradient-inner)"
//           />
//           <circle 
//             className={styles['inner-layer']}
//             cx={r}
//             cy={r}
//             r={r-25}
//             stroke="url(#gradient-inner)"
//           />
//           <circle 
//             className={styles['outer-layer']}
//             cx={r}
//             cy={r}
//             r={r-(state.innerWidth < 600 ? 10 : 20)}
//             stroke="url(#gradient-outer)"
//           />
//           <circle 
//             className={styles['outer-layer']}
//             cx={r}
//             cy={r}
//             r={r-(state.innerWidth < 600 ? 10 : 20)}
//             stroke="url(#gradient-outer)"
//           />
//           <circle 
//             className={styles['center-layer']}
//             cx={r}
//             cy={r}
//             r={r/6}
//             fill="url(#center-layer-back)"
//           />
//           <circle 
//             className={styles['center-layer-front']}
//             cx={r}
//             cy={r}
//             r={r/8}
//             fill="url(#center-layer-front)"
//           />
//           {items.map((_,index)=>
//             <circle 
//               key={index}
//               className={styles['mini-circle']}
//               cx={getMiniCircleCoordinate(index * (360/items.length)).x}
//               cy={getMiniCircleCoordinate(index * (360/items.length)).y}
//               r={state.innerWidth < 600 ? 5 : 10}
//               fill={index % 2 === 0 ? "url(#mini-circle-red)" : "url(#mini-circle-white)"}
//             />
//           )}
//         </svg>
//         <animated.div 
//           className={styles['wrapper']}
//           style={{
//             width: r*2,
//             height: r*2,
//             ...springProps
//           }}
//         >
//           {items.map((item, index) =>
//             <div 
//               key={index}
//               className={`${styles['item']} ${styles[index % 2 === 0 ? 'odd' : 'even']}`}
//               style={{
//                 transform: `rotate(${360/items.length * index}deg)`,
//                 width: r*2*Math.PI / items.length,
//                 left: r - ((r*2*Math.PI / items.length) / 2)
//               }}
//             >
//               {renderItem(item, index)}
//             </div>
//           )}
//         </animated.div>
//         {props.footer && props.footer((selectedValues) => recursiveSpin(selectedValues, selectedValues[index]), state.finished)}
//       </div>
//     )
//   }

//   return (
//     <Fragment>
//       {props.customRenderer ? props.customRenderer(mainRenderer(), (selectedValues) => recursiveSpin(selectedValues, selectedValues[index]), state.finished) : mainRenderer()}
//     </Fragment>
//   )
// }

// export default LuckyWheel
