import { IGetReferralList, IGetSocialRaidTweetMission, ISetReferralReturn, ReferralPayload, SocmedMissionUserPayload } from "@/types/service-types"
import useFrontendInstance from "./instance"
import { RawAxiosRequestHeaders } from "axios"

const useSocmedMissionService = () => {
  const instance = useFrontendInstance("account/project")

  return {
    getReferralList: (username: string, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<Array<IGetReferralList>>>(`/${username}/referral/get`, {headers}),
    referralSet: (username: string, payload: ReferralPayload, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<ISetReferralReturn>>(`/${username}/referral/set`, payload, {headers}),
    connectTelegram: (username: string, payload: SocmedMissionUserPayload, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<boolean>>(`/${username}/mission/telegram/connect`, payload, {headers}),
    joingroupTelegram: (username: string, payload: SocmedMissionUserPayload, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<boolean>>(`/${username}/mission/telegram/joingroup`, payload, {headers}),
    joinchannelTelegram: (username: string, payload: SocmedMissionUserPayload, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<boolean>>(`/${username}/mission/telegram/joinchannel`, payload, {headers}),
    connectDiscord: (username: string, payload: SocmedMissionUserPayload, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<boolean>>(`/${username}/mission/discord/connect`, payload, {headers}),
    joinDiscord: (username: string, payload: SocmedMissionUserPayload, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<boolean>>(`/${username}/mission/discord/join`, payload, {headers}),
    verifyRoleDiscord: (username: string, payload: SocmedMissionUserPayload, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<boolean>>(`/${username}/mission/discord/verifyrole`, payload, {headers}),
    connectTwitter: (username: string, payload: SocmedMissionUserPayload, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<boolean>>(`/${username}/mission/twitter/connect`, payload, {headers}),
    followTwitter: (username: string, payload: SocmedMissionUserPayload, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<boolean>>(`/${username}/mission/twitter/follow`, payload, {headers}),
    likeTweetTwitter: (username: string, payload: SocmedMissionUserPayload, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<boolean>>(`/${username}/mission/twitter/liketweet`, payload, {headers}),
    retweetTwitter: (username: string, payload: SocmedMissionUserPayload, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<boolean>>(`/${username}/mission/twitter/retweet`, payload, {headers}),
    quotepostTwitter: (username: string, payload: SocmedMissionUserPayload, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<boolean>>(`/${username}/mission/twitter/quotepost`, payload, {headers}),
    commentTwitter: (username: string, payload: SocmedMissionUserPayload, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<boolean>>(`/${username}/mission/twitter/comment`, payload, {headers}),
    walletConnect: (username: string, payload: SocmedMissionUserPayload, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<boolean>>(`/${username}/mission/wallet/connect`, payload, {headers}),
    visitYoutubeChannel: (username: string, payload: SocmedMissionUserPayload, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<boolean>>(`/${username}/mission/youtube/visitchannel`, payload, {headers}),
    watchYoutubeVideo: (username: string, payload: SocmedMissionUserPayload, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<boolean>>(`/${username}/mission/youtube/watchvideo`, payload, {headers}),
    dailyCheckin: (username: string, payload: SocmedMissionUserPayload, headers?: RawAxiosRequestHeaders) => instance.post<ResponseAPI<boolean>>(`/${username}/mission/daily/checkin`, payload, {headers}),
    getSocialRaidTweets: (username: string, headers?: RawAxiosRequestHeaders) => instance.get<ResponseAPI<Array<IGetSocialRaidTweetMission>>>(`/${username}/mission/twitter/socialraid/get`, {headers}),
  }
}

export default useSocmedMissionService