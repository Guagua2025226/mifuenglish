import lijing from "@/assets/sales-lijing.jpg";
import zheng from "@/assets/sales-zhengjiabao.jpg";

export interface Sales {
  id: "lijing" | "zhengjiabao";
  name: string;
  company: string;
  image: string;
}

export const SALES_CONSULTANTS: Sales[] = [
  { id: "lijing", name: "李晶", company: "北京米赋教育科技有限公司", image: lijing },
  { id: "zhengjiabao", name: "郑家宝", company: "北京米赋教育科技有限公司", image: zheng },
];

export const pickRandomSales = (): Sales =>
  SALES_CONSULTANTS[Math.floor(Math.random() * SALES_CONSULTANTS.length)];
