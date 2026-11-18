import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(useGSAP, ScrollTrigger, Flip, Draggable);

export { gsap, useGSAP, ScrollTrigger, Flip, Draggable };
