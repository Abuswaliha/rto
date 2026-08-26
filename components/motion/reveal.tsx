"use client";
import { motion,useReducedMotion } from "framer-motion";
export function Reveal({children,delay=0,direction="up",className=""}:{children:React.ReactNode;delay?:number;direction?:"up"|"left"|"right"|"none";className?:string}){const reduced=useReducedMotion();const offset=direction==="left"?{x:-20}:direction==="right"?{x:20}:direction==="up"?{y:18}:{};return <motion.div className={className} initial={reduced?false:{opacity:0,...offset}} whileInView={{opacity:1,x:0,y:0}} viewport={{once:true,amount:.16}} transition={{duration:.45,delay,ease:[.22,1,.36,1]}}>{children}</motion.div>}
