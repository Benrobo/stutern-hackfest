import { Poppins, Fira_Sans, JetBrains_Mono } from "next/font/google";

export const ppReg = Poppins({
  subsets: ["latin"],
  variable: "--font-ppReg",
  weight: ["400"],
});

export const ppL = Poppins({
  subsets: ["latin"],
  variable: "--font-ppL",
  weight: ["300"],
});

// bold poppins
export const ppB = Poppins({
  subsets: ["latin"],
  variable: "--font-ppB",
  weight: ["600"],
});

// extra bold
export const ppSB = Poppins({
  subsets: ["latin"],
  variable: "--font-ppSB",
  weight: ["600"],
});

export const ppEB = Poppins({
  subsets: ["latin"],
  variable: "--font-ppEB",
  weight: ["900"],
});

// Fira code
export const jbR = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbR",
  weight: ["300"],
});

export const jbSB = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbSB",
  weight: ["400"],
});

export const jbEB = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbEB",
  weight: ["800"],
});
