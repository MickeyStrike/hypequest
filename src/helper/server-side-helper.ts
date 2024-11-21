import { ILookup } from "."

export const fetchFont = async (text: string, font: string): Promise<ArrayBuffer | null> => {
  const API_URL = new URL("https://fonts.googleapis.com/css2")
  API_URL.searchParams.set("family", font)
  API_URL.searchParams.set("text", encodeURIComponent(text))

  const css = await (
    await fetch(API_URL.href, {
      headers: {
        "User-Agent": "Mozilla/5.0 (BB10; Touch) AppleWebkit/537.1+ (KHTML, like Gecko) Version/10.0.0.1337 Mobile Safari/537.1+"
      }
    })
  ).text()

  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  )

  if(!resource) return null

  const res = await fetch(resource[1])

  return res.arrayBuffer()
}

export const lookup: Array<ILookup> = [
  { value: 1, symbol: "" },
  { value: 1e3, symbol: "K" },
  { value: 1e6, symbol: "M" },
  { value: 1e9, symbol: "G" },
  { value: 1e12, symbol: "T" },
  { value: 1e15, symbol: "P" },
  { value: 1e18, symbol: "E" }
];

export const nFormatter = (num: number, digits: number) => {
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup.slice().reverse().find((i) => {
    return num >= i.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}