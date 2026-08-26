"use client";
import { motion,useReducedMotion } from "framer-motion";
export function RevealText({text,className="",delay=0,as="h1"}:{text:string;className?:string;delay?:number;as?:"h1"|"h2"}){const reduced=useReducedMotion();const shared={className,initial:reduced?false:{opacity:0,y:12,filter:"blur(3px)"},animate:{opacity:1,y:0,filter:"blur(0px)"},transition:{duration:.52,delay,ease:[.22,1,.36,1] as [number,number,number,number]}};return as==="h2"?<motion.h2 {...shared}>{text}</motion.h2>:<motion.h1 {...shared}>{text}</motion.h1>}
