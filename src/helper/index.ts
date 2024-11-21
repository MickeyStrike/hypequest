"use client"

import Ajv, { Schema, JSONSchemaType } from "ajv"
import { useReducer, useRef, useEffect, useState, RefObject, DependencyList, ReactNode, createElement } from "react"
import CryptoJsHelper from "./crypto-js-helper";
import CONSTANT from "@/Constant";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { DateTime } from "luxon"
import { IUser, IUserBy } from "@/types/service-types";
import { FormikContextType } from "formik";
// @ts-ignore
import ModelViewer from "@metamask/logo"

const cryptoJsHelper = new CryptoJsHelper()

export interface MinimizedStatePersistentConfig<T> {
  persistentName: string;
  schema: Schema | JSONSchemaType<T>;
}

export const useMinimizedState = <T extends object>(initialState: T, persistentConfig?: MinimizedStatePersistentConfig<T>) => {
  const getSafeInitState = (config: MinimizedStatePersistentConfig<T>): T => {
    try {
      // const ajv = new Ajv()
      const ls = localStorage.getItem(config.persistentName)
      if(ls && cryptoJsHelper.decrypt(ls)) {
        const decrypLs = cryptoJsHelper.decrypt(ls)

        // if(isJsonString(decrypLs) && ajv.compile(config.schema)(JSON.parse(decrypLs))) return JSON.parse(decrypLs)
        if(isJsonString(decrypLs)) return JSON.parse(decrypLs)
        else return initialState
      }
      else return initialState
    }
    catch(err) {
      return initialState
    }
  }

  return useReducer((s: T, ns: Partial<T>) => {
    const result = {...s, ...ns}

    if(persistentConfig) localStorage.setItem(persistentConfig.persistentName, cryptoJsHelper.encrypt(JSON.stringify(result)))

    return result
  }, persistentConfig ? getSafeInitState(persistentConfig) : initialState)
}

export const isJsonString = (jsonString: string) => {
  try {
    JSON.parse(jsonString)
    return true
  }
  catch(err) {
    return false
  }
}

export const debounce = <T extends (...args: any) => any>(
  func: T,
  wait?: number
) => {
  let timeout: NodeJS.Timeout | number | undefined;
  return (...args: any) => {
    const later = () => {
      timeout = undefined;

      func(...args);
    };
    clearTimeout(timeout as number | undefined);

    timeout = setTimeout(later, wait);
  };
};

export const useDebounce = <T extends Array<any>>(
  func: (...args: [...T]) => void,
  args: T,
  wait?: number,
  funcBeforeDebounce?: () => void
) => {
  const debounceProcess = useRef(debounce(func, wait));

  const listener = () => {
    if (funcBeforeDebounce) funcBeforeDebounce();
    debounceProcess.current(...args);
  };

  useEffect(listener, [...args]);
};

export const normFile = (e: any) => {
  console.log('Upload event:', e);
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

export const middleEllipsisText = (str: string, start: number = 6, end: number = 3, ellipsisText: string = '...') => {
	if (str.length > (start+end)) {
		return str.slice(0, start) + ellipsisText + str.slice(str.length - end, str.length);
	}
	return str;
}

export const copyToClipboard = async (text: string, delay?: (value: boolean) => void) => {
  await navigator.clipboard.writeText(text)

  if(delay) {
    delay(true)
    setTimeout(()=>{
      delay(false)
    }, 3000)
  }
}

export const getInitialName = (value: string) => {
  return value.split(" ").map(v => v[0]).join("").toUpperCase()
}

export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const capitalizeEveryWord = (sentence: string) => {
	const words = sentence.split(" ")
	const newWords = words.map(word => capitalizeFirstLetter(word))
	return newWords.join(" ")
}

export const isValidPattern = (pattern: string) => {
  try {
    new RegExp(pattern)

    return true
  }
  catch(err) {
    return false
  }
}

export const useThemeDetector = () => {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);  
  
  useEffect(() => {
    const getCurrentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const listenerCallback = () => setIsDarkTheme(getCurrentTheme)
    
    listenerCallback()
    window.addEventListener("change", listenerCallback)
    return () => window.removeEventListener("change", listenerCallback);
  }, []);
  return isDarkTheme;
}

export const numFormatter = (n: string | number, decimalSymbol = '.') => {
  if (Number(n) > 0) {
    const splitNumber = String(n).split(decimalSymbol);
    if (splitNumber.length > 1)
      return (
        splitNumber[0].replace(/(.)(?=(\d{3})+$)/g, '$1.') +
        `,${splitNumber[1]}`
      );
    else return String(n).replace(/(.)(?=(\d{3})+$)/g, '$1.');
  } else {
    const splitNumber = String(Number(n) * -1).split(decimalSymbol);
    if (splitNumber.length > 1)
      return (
        '-' +
        splitNumber[0].replace(/(.)(?=(\d{3})+$)/g, '$1.') +
        `,${splitNumber[1]}`
      );
    else return String(n).replace(/(.)(?=(\d{3})+$)/g, '$1.');
  }
};

export const getDiffPercentage = (before: number, after: number) => {
  if(before !== 0) return (after-before)/before * 100
  else return 0
}

export interface FirstAndLastDateReturn {
  firstDay: Date;
  lastDay: Date;
}
export const getFirstAndLastDayOfMonth = (d: Date): FirstAndLastDateReturn => {
  const date = new Date(d), y = date.getFullYear(), m = date.getMonth();
  const firstDay = new Date(y, m, 1);
  const lastDay = new Date(y, m + 1, 0);

  return {firstDay, lastDay}
}

export const addSearchParams = (href: string, params: Params) => {
  if(isValidHttpUrl(href)) {
    const url = new URL(href)

    Object.entries(params).forEach(([key, val]) => {
      if(val) url.searchParams.set(key, val)
    })

    return url.href
  }
  else {
    Object.entries(params).forEach(([key, val], index) => {
      if(val) {
        if(index > 0) href += `&${key}=${val}`
        else href += `?${key}=${val}`
      }
    })
  
    return href
  }
}

export const dateToEpoch = (date: Date) => {
  return (date.getTime() - date.getMilliseconds()) / 1000
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
export const getRandomArbitrary = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
}

/**
* Returns a random integer between min (inclusive) and max (inclusive).
* The value is no lower than min (or the next integer greater than min
* if min isn't an integer) and no greater than max (or the next integer
* lower than max if max isn't an integer).
* Using Math.round() will give you a non-uniform distribution!
*/
export const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const generateRandomHex = () => {
  return "#" + Math.floor(Math.random()*16777215).toString(16)
}

export const colorLuminance = (hex: string, lum: number) => {
  // validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, '');
  if (hex.length < 6) {
    hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  }
  lum = lum || 0;

  // convert to decimal and change luminosity
  let rgb = "#", c, i;
  for (i = 0; i < 3; i++) {
    const slicer = hex.slice(i*2,2) ? hex.slice(i*2,2) : "0"
    c = parseInt(slicer, 16);
    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
    rgb += ("00"+c).slice(c.length);
  }

  return rgb;
}

export const downloadFile = (url: string, fileName: string) => {
  const aElement = document.createElement('a');
  aElement.setAttribute('download', fileName);
  aElement.href = url;
  aElement.setAttribute('target', '_blank');
  aElement.click();
  URL.revokeObjectURL(url);
}

export const convertToCSV = (data: Array<Array<string>>, documentName?: string) => {
  let csvContent = "data:text/csv;charset=utf-8," + data.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  downloadFile(encodedUri, documentName ?? "defaultName.csv")
}

export const getSignMessage = () => {
  return CONSTANT.SIGN_MESSAGE.replace(/<nonce>/g, DateTime.fromJSDate(new Date()).toMillis().toString())
}

export const incrementDay = (date: Date, day: number) => {
  date.setDate(date.getDate() + day)

  return date
}

export const formatBytes = (bytes: number, decimals: number = 2) => {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export interface ILookup {
  value: number;
  symbol: string;
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

export type ClickListener<K extends keyof DocumentEventMap> = (this: Document, ev: DocumentEventMap[K]) => any

export const useClickOutside = <T extends HTMLElement>(ref: RefObject<T>, handler: (evt: MouseEvent) => void) => {
  useEffect(() => {
    let startedInside = false;
    let startedWhenMounted = false;

    const listener: ClickListener<"click"> = (event) => {
      // Do nothing if `mousedown` or `touchstart` started inside ref element
      if (startedInside || !startedWhenMounted) return;
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) return;

      handler(event);
    };

    const validateEventStart = (event: TouchEvent | MouseEvent) => {
      startedWhenMounted = !!ref.current;
      startedInside = !!(ref.current && ref.current.contains(event.target as Node));
    };

    document.addEventListener<"mousedown">("mousedown", validateEventStart);
    document.addEventListener<"touchstart">("touchstart", validateEventStart);
    document.addEventListener<"click">("click", listener);

    return () => {
      document.removeEventListener<"mousedown">("mousedown", validateEventStart);
      document.removeEventListener<"touchstart">("touchstart", validateEventStart);
      document.removeEventListener<"click">("click", listener);
    };
  }, [ref, handler]);
};

export const isValidHttpUrl = (url: string) => {
  let result: URL
  try {
    result = new URL(url);
  } catch (_) {
    return false;  
  }

  return result.protocol === "http:" || result.protocol === "https:";
}

export const objectUrlEncoder = (object: Record<string, any>, strictToEncoded?: boolean) => {
  Object.entries(object).forEach(([label, value]) => {
    if(strictToEncoded) object[label] = encodeURIComponent(value)
    else if(isValidHttpUrl(value)) object[label] = encodeURIComponent(value)
  })

  return object
}

export const randomIntFromInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export const randomDecimalFromInterval = (min: number, max: number) => {
  const value = Math.random() * (max - min + 1) + min
  return value > max ? Math.floor(value) : value
}

export const reorder = <T>(list: Array<T>, startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const routeToUrl = (route: string, params: Record<string, any>) => {
  let result = route

  Object.entries(params).forEach(([propName, propVal], index) => {
    if(index > 0) result += `&${propName}=${propVal}`
    else result += `?${propName}=${propVal}`
  })

  return result
}

export const getTotalPaginationPage = (total: number): number => {
  return Math.ceil(total)
}

export const fixedNumber = (num: string | number, fractionDigits?: number) => Number(Number(num).toFixed(fractionDigits))

export const redirectToNewPage = (url: string, isNewTab: boolean) => {
  const link = document.createElement('a');
  link.href = url;
  if (isNewTab) link.target = '_blank';
  link.click();
  link.remove();
};

interface InitialWindowFocusState {
  isFocus: boolean;
}

export const useWindowFocus = (callback: () => void) => {
  const [state, dispatch] = useMinimizedState<InitialWindowFocusState>({
    isFocus: true
  })

  useEffect(() => {
    const onFocus = () => dispatch({isFocus: true});
    const onBlur = () => dispatch({isFocus: false});

    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  useEffect(()=>{
    if(state.isFocus) callback()
  }, [state.isFocus])

  return state
}

export const loginTelegram = (callback:  (data: false | TUser) => void) => {
  if(window.Telegram?.Login?.auth) window.Telegram?.Login?.auth?.({bot_id: CONSTANT.TELEGRAM_BOT_ID, request_access: true}, callback)
  else callback(false)
}

export const userByRenderer = (data: IUserBy, render: (data: IUser) => ReactNode) => {
  if(typeof data === "string") return data
  else return render(data)
}

export const submitFormikForm = async <T>(formik: FormikContextType<T>) => {
  try {
    const validate = await formik.validateForm()
    const objects = Object.entries(validate).map(([key]) => [key, true])
    if(objects.length > 0) formik.setTouched(Object.fromEntries(objects))
    else await formik.submitForm()
  }
  catch(err) {
    console.log(err)
  }
}

export const timeAgo = (dateTime: DateTime) => {
  const units: Intl.RelativeTimeFormatUnit[] = [
    'year',
    'month',
    'week',
    'day',
    'hour',
    'minute',
    'second',
  ];

  const diff = dateTime.diffNow().shiftTo(...units);
  const unit = units.find((unit) => diff.get(unit) !== 0) || 'second';

  const relativeFormatter = new Intl.RelativeTimeFormat('en', {
    numeric: 'auto',
  });
  return relativeFormatter.format(Math.trunc(diff.as(unit)), unit);
};

export const dateFromNow = (date: string | Date) => {
  if(typeof date === "string") return DateTime.fromISO(date).toRelative({base: DateTime.now()})
  else DateTime.fromJSDate(date).toRelative({base: DateTime.now()})
}

export const smoothScroll = (elementId: string, headerHeight: number) => {
	const scrollElement = document.getElementById(elementId)?.offsetTop || 0;
	window.scrollTo({ top: scrollElement-headerHeight, behavior: 'smooth'});
}

export const smoothScrollByRef = (element: HTMLElement) => {
  element.scrollIntoView({behavior:'smooth'})
}

export const getListDescription = <T extends ReactNode>(label: ReactNode, value?: T) => {
  if(value) return createElement('div', {className: "flex flex-row items-baseline justify-between gap-2"}, 
    createElement('div', null, label + ":"),
    createElement('hr', {
      className: "m-0 grow border-none h-[1px] bg-repeat-x",
      style: {
        backgroundPosition: "50% center",
        height: "1px",
        backgroundImage: "linear-gradient(90deg, rgb(141 141 141 / 60%) 30%, rgba(255, 255, 255, 0) 0px)",
        backgroundSize: "5px 1px",
      }
    }),
    createElement('div', null, value)
  )
}

export const useMetamaskLogo = (config?: Record<string, any>, deps?: DependencyList) => {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(()=>{
    if(ref.current) {
      const viewer = ModelViewer({
        // Dictates whether width & height are px or multiplied
        pxNotRatio: true,
        width: 500,
        height: 400,
        // pxNotRatio: false,
        // width: 0.9,
        // height: 0.9,
      
        // To make the face follow the mouse.
        followMouse: false,
      
        // head should slowly drift (overrides lookAt)
        slowDrift: false,
        ...config
      });
      
      // add viewer to DOM
      ref.current.replaceChildren(viewer.container);
      
      // look at something on the page
      viewer.lookAt({
        x: 100,
        y: 100,
      });
      
      // enable mouse follow
      viewer.setFollowMouse(true);
      
      // deallocate nicely
      viewer.stopAnimation();
    }
  }, [ref.current, ...(deps ?? [])])

  return createElement('div', {
    ref
  })
}