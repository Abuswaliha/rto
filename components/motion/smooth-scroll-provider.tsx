"use client";
import { useEffect } from "react";
export function SmoothScrollProvider({children}:{children:React.ReactNode}){useEffect(()=>{document.documentElement.classList.add("smooth-ready");return()=>document.documentElement.classList.remove("smooth-ready")},[]);return children}
