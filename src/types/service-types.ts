import { DropzoneReturnValues } from "@/components/reusables/NextuiTheme";
import { ReactNode } from "react";

export enum ActiveTabEnum {
  PROFILE = "PROFILE",
  SETTING = "SETTING",
  MILESTONE_AND_REWARDS = "MILESTONE_AND_REWARDS",
  REDEEMED_LIST = "REDEEMED_LIST",
}

export enum StageRewardTypeEnum {
  XP = "XP",
  USDT = "USDT"
}

export enum RewardServeEnum {
  RANDOW_DRAW_WINNER = "RANDOW_DRAW_WINNER",
  FIRST_COME_FIRST_SERVE = "FIRST_COME_FIRST_SERVE",
}

export interface IUser {
  _id?: string;
  wallet_address: string;
  email: string;
  token: string;
  key_token: string;
  name: string;
  avatar: string;
  email_verified_date: string;
  created_date: string;
  updated_date: string;
}

export type IUserBy = IUser | string

export interface LoginPayload {
  wallet_address: string;
  message: string;
  signature_hash: string;
}

export interface LoginResponse {
  auth_token: string;
}

export interface ReferralPayload {
  referral_code: string;
}

export interface IUsernameClientChecker {
  clientProjectId?: string;
  username: string;
}

export interface IClientStage {
  _id?: string;
  clientProjectId: string;
  created_by: IUserBy;
  updated_by?: IUserBy;
  icon?: string;
  background_color?: string;
  type: StageRewardTypeEnum;
  value: number;
  target_max_followers: number;
  target_max_transaction_count?: number;
  total_transaction_count?: number;
  sequence: number;
  created_date: string;
  updated_date: string;
  is_transaction_count?: boolean;
  contract_address?: Array<string>;
  chains?: Array<number>;
}

export interface IDetailClientProject {
  clientProjectId: string;
}

export interface IClient {
  _id?: string;
  created_by: IUserBy;
  updated_by?: IUserBy;
  username: string;
  name: string;
  token_name?: string;
  logo: string;
  favicon?: string;
  url: string;
  description: string;
  created_date: string;
  updated_date: string;
  email: string;
  stages: Array<IClientStage>;
  is_social_raid_feature: boolean;
  max_earned_xp: number;
  is_lucky_wheel_feature: boolean;
  is_free_spin: boolean;
  admins: Array<IUserBy>;
  chains: Array<number>;
  convertion_consumption_spin: Array<IConvertionConsumptionSpin>;
  telegram?: ITelegramCallback;
  twitter?: ITwitterCallback;
  discord?: IDiscordCallback;
  telegram_channel_member_count?: number;
  telegram_group_link?: string;
  telegram_group_member_count: number;
  twitter_follower_count: number;
  zealy_feature?: boolean;
  zealy_subdomain?: string;
  accumulatedPoints?: IAccumulatePointsClientResponse;
}

export interface ICreateClient {
  clientProjectId?: string;
  username: string;
  name: string;
  token_name?: string;
  logo?: File;
  favicon?: File;
  url?: string;
  email: string;
  description?: string;
  chains: Array<number>;
  telegramGroupLink?: string;
}

export type IUpdateClient = Omit<ICreateClient, "clientProjectId"> & { clientProjectId: string; }

export interface ICreateClientStage {
  clientProjectStageId?: string;
  clientProjectId: string;
  icon?: File;
  iconFilename?: string;
  type: StageRewardTypeEnum;
  targetMaxFollowers: number;
  target_max_transaction_count: number;
  value: number;
  sequence: number;
  backgroundColor?: string;
  is_transaction_count: boolean;
  contract_address?: Array<string>;
  chains?: Array<number>;
}

export type IUpdateClientStage = Omit<ICreateClientStage, "clientProjectStageId"> & { clientProjectStageId: string; }

export interface ICreateQuestboard {
  questBoardId?: string;
  clientProjectId: string;
  title: string;
  description?: string;
  extra_reward_point?: number;
  extra_reward_type?: StageRewardTypeEnum;
  reward_name?: string;
  number_of_rewards?: number;
  distribute_reward_epoch?: number;
  start_redemption_epoch?: number;
  end_redemption_epoch?: number;
  reward_serve_type?: RewardServeEnum;
  extra_max_joiner?: number;
  background_color?: string;
  missions: Array<IMission>;
}

export type IUpdateQuestboard = Omit<ICreateQuestboard, "questBoardId"> & {
  questBoardId: string;
}

export interface IQuestboard {
  _id: string;
  title: string;
  description: string;
  extra_reward_point: number;
  quester: number;
  extra_reward_type: StageRewardTypeEnum;
  reward_name?: string;
  number_of_rewards?: number;
  distribute_reward_date?: string;
  reward_serve_type?: RewardServeEnum;
  start_redemption_date: string;
  end_redemption_date: string;
  clientProject: IClient;
}

export interface IDetailQuestboard {
  questBoardId: string;
  title: string;
  description: string;
  extra_reward_point: number;
  extra_reward_type: StageRewardTypeEnum;
  reward_name?: string;
  number_of_rewards?: number;
  distribute_reward_date?: string;
  reward_serve_type?: RewardServeEnum;
  start_redemption_date: string;
  end_redemption_date: string;
  clientProject: IClient;
  questboard_thumbnail?: string;
  missions: Array<IMission>;
}

export interface IGetDetailQuestboard {
  questBoardId: string;
}

export enum MissionTypesEnum {
  DAILY_CHECKIN = 'Daily Checkin',
  CONNECT_WALLET = 'Connect Wallet',
  REFERRAL = 'Referral',
  CONNECT_TWITTER = 'Connect Twitter',
  FOLLOW_TWITTER = 'Follow Twitter',
  LIKE_TWEET_TWITTER = 'Like Tweet Twitter',
  RETWEET_TWITTER = 'Retweet Twitter',
  QUOTE_POST_TWITTER = 'Quote Post Twitter',
  COMMENT_TWITTER = 'Comment Twitter',
  SOCIAL_RAID_TWITTER = 'Social Raid Twitter',
  CONNECT_DISCORD = 'Connect Discord',
  JOIN_DISCORD = 'Join Discord',
  CONNECT_TELEGRAM = 'Connect Telegram',
  JOIN_GROUP_TELEGRAM = 'Join Group Telegram',
  JOIN_CHANNEL_TELEGRAM = 'Join Channel Telegram',
  CONNECT_ZEALY = 'Connect Zealy',
  WATCH_VIDEO_YOUTUBE = 'Watch Video Youtube',
  VISIT_CHANNEL_YOUTUBE = 'Visit Channel Youtube',
  EXTRA_REWARD_QUESTBOARD = 'Extra Reward Questboard',
  VERIFY_ROLE_DISCORD = 'Verify Role Discord'
}
export enum QuestboardTypeEnum {
  ONGOING = "ONGOING",
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
}

export interface IGetDiscordRolesRequest {
  server_id: string;
}

export interface IGetDiscordRolesResponse {
  guild: string;
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  rawPosition: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
  flags: number;
  tags?: Record<string, any>;
  createdTimestamp: number;
}

export interface IGetQuestboardsRequest extends PaginationRequest {
  username: string;
  type?: QuestboardTypeEnum;
}

export interface IMissionRequest extends PaginationRequest {
  questBoardId: string;
}

export interface IMissionData extends Record<string, any> {
  rewardType?: StageRewardTypeEnum;
  bgColor?: string;
}

export interface IMission {
  _id?: string;
  clientProjectId: string;
  created_by?: IUserBy;
  updated_by?: IUserBy;
  title?: string;
  description?: string;
  point_reward: number;
  usdt_reward: number;
  is_deleted: boolean;
  data?: IMissionData;
  object?: IMissionData;
  type: MissionTypesEnum;
  created_date?: string;
  updated_date?: string;
  start_redemption_date?: string;
  end_redemption_date?: string;
}

export interface IJoinTelegramMission {
  username_group: string;
}

export interface IFollowTwitterMission {
  username: string;
}

export interface ILikeTwitterMission {
  username: string;
  id_tweet: string;
}

export interface IRetweetTwitterMission {
  username: string;
  id_tweet: string;
  text?: string;
}

export interface IPostTwitterMission {
  text?: string;
}

export interface IDiscordJoinMission {
  server_id: string;
}

export interface IYoutubeMission {
  url: string;
}

export interface ICreateMission {
  missionId?: string;
  label: string;
  description?: string;
  is_deleted?: boolean;
  questBoardId?: string;
  thumbnail?: File;
  clientProjectId: string;
  point_reward: number;
  usdt_reward: number;
  type: MissionTypesEnum;
  object: Record<string, any> | IJoinTelegramMission | IFollowTwitterMission | ILikeTwitterMission | IRetweetTwitterMission | IPostTwitterMission | IDiscordJoinMission | IYoutubeMission
  start_redemption_epoch?: number;
  end_redemption_epoch?: number;
}

export type IUpdateMission = Omit<ICreateMission, "missionId"> & { missionId: string; }

export interface IDetailMission {
  missionId: string;
}
export interface ICreateMarketplace {
  marketplaceId?: string;
  clientProjectId: string;
  name: string;
  xp_cost: number;
  qty: number;
  available_count: number;
  description?: string;
  is_redeem_once?: boolean;
  tags: Array<string>;
  photo?: File;
  start_redemption_epoch?: number;
  end_redemption_epoch?: number;
}

export interface IMarketplace {
  _id?: string;
  clientProjectId: string;
  name: string;
  xp_cost: number;
  qty: number;
  available_count: number;
  description?: string;
  is_redeem_once: boolean;
  tags: Array<string>;
  photo?: string;
  start_redemption_date?: Date;
  end_redemption_date?: Date;
  created_date: Date;
  updated_date: Date;
  created_by: IUserBy;
  updated_by?: IUserBy;
}

export type IUpdateMarketplace = Omit<ICreateMarketplace, "marketplaceId"> & { marketplaceId: string; }

export interface IGetMarketplace {
  clientProjectId: string;
}

export type IGetMarketplacePagination = IGetMarketplace & PaginationRequest

export interface IMarketplaceWithoutPagination {
  name_role: string;
  data: Array<IMarketplace>;
}

export interface IDetailMarketplace {
  marketplaceId: string;
}

export interface SocmedAdminAuthParams {
  client_project_id: string;
  authorization: string;
  redirect_url: string;
}

export interface SocmedAuthParams {
  authorization: string;
  redirect_url: string;
}

export interface TelegramAuthRequest {
  hash: string;
  telegram_id: number;
  username: string;
  first_name: string;
  last_name: string;
  photo_url: string;
  auth_date: number;
}

export interface SocmedMissionUserPayload {
  missionId: string;
}

export enum LeaderboardTypeEnum {
  POINT = "point", 
  USDT = "usdt", 
  ZEALY_XP = "zealy_xp"
}

export interface GetLeaderboardParams {
  type_leaderboard: LeaderboardTypeEnum;
  page: number,
  limit: number
}

export interface GetLeaderboardResponse {
  id: string;
  wallet_address: string;
  value: number;
  name?: string;
  avatar?: string;
  twitter_avatar?: string;
  share: string
}

export interface MetaLeaderboardResponse {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  prev?: number;
  next?: number;
  yourRank: number
}

export interface GetUserInfoParams {
  type_leaderboard: "usdt" | "point" | "zealy_xp";
}

export interface GetHistoryResponse {
  id: string;
  title: string;
  type: MissionTypesEnum;
  created_date: string;
  updated_date: string;
}

export interface GetPublicMission {
  id: string;
  title: string;
  description: string;
  point_reward: number;
  usdt_reward: number;
  data: IMissionData;
  type: MissionTypesEnum;
  is_claimed: boolean;
  start_redemption_date?: string;
  end_redemption_date?: string;
  created_date: string;
  updated_date: string;
}

export enum LuckyWheelTypesEnum {
  XP = "XP",
  USDT = "USDT",
  CUSTOM = "Custom",
  GOOD_LUCK = "Good Luck",
  FREE_SPIN = "Free Spin"
}

export interface ILuckyWheel {
  _id?: string;
  clientProjectId: string;
  created_by: IUserBy;
  updated_by?: IUserBy;
  marketplaceId?: IMarketplace;
  icon?: string;
  qty: number;
  max_spin: number; // 0 = not set, > 1 = set per user
  percentage: number;
  value: number;
  is_multiply: boolean;
  type_reward: LuckyWheelTypesEnum;
  created_date: string;
  updated_date?: string;
}

export interface GetAllLuckyWheel {
  clientProjectId: string;
}

export interface GetDetailLuckyWheel {
  clientProjectId: string;
  id: string;
}

export interface CreateLuckyWheelRequest {
  id?: string;
  clientProjectId: string;
  marketplaceId?: string;
  icon?: File;
  qty?: number;
  max_spin?: number;
  percentage: number;
  type_reward: LuckyWheelTypesEnum;
  is_multiply?: boolean;
  value?: number;
}

export interface UpdateLuckyWheelRequest extends Omit<CreateLuckyWheelRequest, "id"> {
  id: string;
}

export interface IGetAdminSocialRaids {
  clientProjectId: string;
}

export interface ISocialRaidPayload {
  id?: string;
  clientProjectId: string;
  account: string;
  keywords: Array<string>;
}

export interface ISocialRaid {
  _id?: string;
  clientProjectId: string;
  account: string;
  keywords: Array<string>;
  created_date: string;
  updated_date?: string;
  created_by: IUserBy;
  updated_by?: IUserBy;
}

export interface IActivateLuckyWheelOrSocialRaid {
  clientProjectId: string;
  is_active: boolean;
}

export interface IAccumulatePointsClientResponse {
  total_point: number;
  total_zealy_xp: number;
}

export interface IPublicClientResponse extends IClient {
  stages: Array<IClientStage>;
  luckywheels: Array<ILuckyWheel>;
}

export interface IGetSpinResult {
  id: string;
  marketplaceId: string;
  value: number;
  percentage: number;
  type_reward: LuckyWheelTypesEnum;
  is_multiply: boolean;
}

export interface IConvertionConsumptionSpin {
  amount_consumption: number;
  amount_spin: number;
}

export interface ICreateConvertionConsumptionSpin {
  clientProjectId: string;
  items: Array<IConvertionConsumptionSpin>;
}

export interface IUpdateActivateFreeSpin {
  clientProjectId: string;
  value: boolean;
}

export interface IGetTwitterProfile {
  twitter_id: string;
  username: string;
  name: string;
  avatar: string;
}

export interface IGetDiscordProfile {
  discord_id: string;
  username: string;
  name: string;
  avatar: string;
  discriminator: string;
}

export interface IGetTelegramProfile {
  telegram_id: string;
  username: string;
  name: string;
  avatar: string;
}

export interface IGetProfile {
  id: string;
  wallet_address: string;
  email?: string;
  name?: string;
  avatar?: string;
  twitter: Partial<IGetTwitterProfile>;
  discord: Partial<IGetDiscordProfile>;
  telegram: Partial<IGetTelegramProfile>;
}

export interface IUserInfoDataRank {
  rank: number;
  share: string;
  value: number;
}

export interface IGetUserInfo {
  id: string;
  point: number;
  usdt: number;
  zealy_xp: number;
  free_spin: number;
  referral_code: string;
  use_referral_code?: string;
  invite_count: number;
  invited_xp: number;
  date: string;
  data_rank?: IUserInfoDataRank;
}

export interface ILuckyWheelCustom extends ILuckyWheel {
  label: ReactNode;
}

export enum TypePointEnum {
  XP = 'XP',
  ZEALY = 'Zealy XP'
}

export interface IConvertSpinRequest {
  amount_spin: number;
  type_point: TypePointEnum;
}

export interface IDataReferrer {
  id: string;
  wallet_address: string;
  name: string;
  avatar: string;
}

export interface ISetReferralReturn {
  data_referrer: Partial<IDataReferrer>;
}

export enum InventoryStatusEnum {
  NOT_REDEEM = "Not Redeem",
  REQUEST_REDEEM = "Request Redeem",
  REDEEM = "Redeem"
}

export interface IInventoryGet {
  id: string;
  name: string;
  photo: string;
  status: InventoryStatusEnum;
  proof?: string;
  file_proof?: string;
  note_client?: string;
  date?: string;
}

export interface IInventoryRedeemRequest {
  inventoryId: string;
}

export interface IMarketplaceRedeemRequest {
  type_point: TypePointEnum;
  marketplaceId: string;
  qty: number;
}

export interface IMarketplacePublicGet {
  id: string;
  name: string;
  photo: string;
  description: string | null;
  xp_cost: number;
  qty: number;
  start_redemption_date?: string | null;
  end_redemption_date?: string | null;
}

export interface IMarketplaceDetail {
  id: string;
  name: string;
  photo: string;
  description: string;
  xp_cost: number;
  qty: string;
  available_count: string;
  is_redeem_once: string;
  tags: Array<string>;
  is_owned?: boolean;
  start_redemption_date?: string | null;
  end_redemption_date?: string | null;
}

export interface IMarketplaceGetDetail {
  marketplaceId: string;
}

export interface ITwitterCallback {
  id: number;
  username: string;
  displayName: string;
  photos: Array<any>;
}

export interface IDiscordCallback {
  id: number;
  username: string;
  avatar: string;
  discriminator: string;
  global_name: string;
  server_id?: string;
}

export interface ITelegramCallback {
  hash: string;
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  username_group?: string;
}

export interface ILuckywheelUser {
  id: string;
  name: string,
  icon?: string;
  qty: number;
  value: number;
  max_spin: number;
  percentage: number;
  type_reward: LuckyWheelTypesEnum;
  is_multiply: boolean;
}

export interface GetLuckyWheelUser {
  id: string;
  convertion_consumption_spin: Array<IConvertionConsumptionSpin>;
  is_free_spin: boolean;
  available_free_spin: boolean;
  data: Array<ILuckywheelUser>;
}

export enum MetaOGEnum {
  LUCKYWHEEL = "LUCKYWHEEL",
  LUCKYWHEEL_PRIZE = "LUCKYWHEEL_PRIZE",
  LEADERBOARD = "LEADERBOARD",
  REFERRAL = "REFERRAL",
  PAGE = "PAGE",
}

export interface IAuthAdminTelegram {
  clientProjectId: string;
  username: string;
  username_group: string;
}

export interface IAuthAdminDiscord {
  server_id: string;
  clientProjectId: string;
}

export interface IAvatarSetRequest {
  file_avatar: File;
}

export interface IEmailSetRequest {
  email: string;
}

export interface INameSetRequest {
  name: string;
}

export interface IEmailVerifyRequest {
  token_verified: string;
}

export interface IActivateZealyAdmin {
  clientProjectId: string;
  is_active: boolean;
  zealy_subdomain: string;
  zealy_api_key: string;
}

export interface ITemplatePlatform {
  title?: string;
  description?: string;
  type: MissionTypesEnum;
  thumbnail?: DropzoneReturnValues;
  rewardType: StageRewardTypeEnum;
  rewardValue: number;
  text?: string;
  username_group?: string;
  username?: string;
  id_tweet?: string;
  server_id?: string;
  url?: string;
  role?: string;
}

export interface ListContentTemplateItem {
  isCreatedOnce?: boolean;
  isSocialRaidSetting?: boolean;
  label: ReactNode;
  type: MissionTypesEnum;
  form?: ReactNode | null;
}

export interface ListContentTemplate {
  platformName: string;
  platformIcon: ReactNode;
  templates: Array<ListContentTemplateItem>;
}

export interface IGetAllSingleMission extends PaginationRequest {
  clientProjectId: string;
}

export interface IGetSingleMissionDetail {
  clientProjectId: string;
  missionId: string;
}

export enum LastMissionEnum {
  TRENDING = 'trending',
  TOP_QUEST = 'top_quest',
  NEW_POST = 'new_post'
}

export interface ILastMissionRequest {
  search: string;
  type: LastMissionEnum;
  is_available: boolean;
}

export interface ILastMissionProperties {
  id: string;
  questBoardId: string;
  total_quester: number;
  questers?: Array<string>;
  logo?: string;
  thumbnail?: string;
  name: string;
  title?: string;
  description?: string;
  point_reward?: number;
  usdt_reward?: number;
  type: MissionTypesEnum;
  date?: string;
  start_redemption_date?: string;
  end_redemption_date?: string;
}

export interface ILastMissionResponse {
  data_xp?: Array<ILastMissionProperties>;
  data_usdt?: Array<ILastMissionProperties>;
}

export interface IGetXpRewardMissionRequest extends PaginationRequest {
  type: LastMissionEnum;
  is_available: boolean;
}

export interface IGetXpRewardMissionResponse {
  questBoardId: string;
  total_quester: number;
  logo?: string;
  thumbnail?: string;
  name: string;
  title?: string;
  description?: string;
  point_reward: number;
  type: MissionTypesEnum;
  date?: string;
  start_redemption_date?: string;
  end_redemption_date?: string;
}

export type IGetQuesterAvatarRequest = ({
  questBoardId?: string;
  missionId: string;
} | {
  questBoardId: string;
  missionId?: string;
}) & PaginationRequest

export interface IDataPostSocialRaid extends Record<string, any> {
  username: string;
  avatar: string;
  tweet_id: string | number;
  url_post: string;
  post: string;
  name: string;
}

export interface IGetSocialRaidTweetMission {
  id: string;
  title: string;
  description: string;
  point_reward: number;
  usdt_reward: number;
  data: IMissionData & Record<string, any>;
  type: MissionTypesEnum;
  data_post?: IDataPostSocialRaid;
  is_claimed: boolean;
  total_view: number;
  date: string;
  start_redemption_date?: string;
  end_redemption_date?: string;
}

export interface IGetManageAdminRequest {
  username: string;
}

export interface IGetManageAdminResponse {
  id: string;
  name_role: 'Admin' | 'Owner';
  wallet_address: string;
  email: string;
  is_confirm: boolean;
  expired_date: string;
  date: string;
}

export interface IManageAdminInviteRequest {
  username: string;
  email: string;
}

export interface IManageAdminConfirmRequest {
  username: string;
  invite_code: string;
}

export interface IManageAdminInviterRequest {
  username: string;
}

export interface IManageAdminInviterResponse {
  id: string;
  wallet_address: string;
  name?: string;
  avatar?: string;
  email: string;
  date: string;
}

export enum IGetRedeemListStatus {
  ALL = "all",
  PENDING = "pending",
  COMPLETE = "complete"
}

export interface IGetRedeemListRequest extends PaginationRequest {
  username: string;
  status: IGetRedeemListStatus;
}

export interface IGetRedeemListResponse {
  id: string;
  marketplaceId: string;
  spinLogsId: string;
  is_file_proof: boolean;
  data_proof: string;
  note?: string;
  user: Omit<IGetProfile, "id" | "twitter" | "discord" | "telegram">;
  marketplace: Pick<IMarketplaceDetail, "name" | "description" | "photo">;
  date?: string;
  approve_date?: string;
  reject_date?: string;
}

export interface IApprovalRedeemListRequest {
  username: string;
  inventoryId: string;
  note?: string;
  data_proof?: string;
  file_data_proof?: File;
}

export interface IGetReferralList {
  id: string;
  wallet_address: string;
  name: string;
  date: string;
}

export interface CustomQuestboard extends Omit<ICreateQuestboard, "missions"> {
  missions?: Array<GetPublicMission>;
  start_redemption_date?: string;
  end_redemption_date?: string;
}

export interface IChainSupportResponse {
  chain_id: number;
  chain_name: string;
}

export enum MilestoneAndRewardOptions {
  TRANSACTION_COUNTS = "TRANSACTION_COUNTS",
  TWITTER_FOLLOWERS_COUNTS = "TWITTER_FOLLOWERS_COUNTS",
}

export enum ActiveTabKey {
  LEADERBOARD = "LEADERBOARD",
  LUCKY_SPIN = "LUCKY_SPIN",
  QUEST = "QUEST",
  SOCIAL_RAID = "SOCIAL_RAID"
}

export interface IBannerProgressStages extends IClientStage {
  is_reached?: boolean;
}

export interface IUpdateQuestboardThumbnail {
  questboardThumbnail: File;
  questBoardId: string;
}