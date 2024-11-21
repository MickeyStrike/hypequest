export enum TabEnum {
  SETUP = 'setup',
  QUEST_TYPE = 'quest-type',
  REWARD = 'reward'
}

const menuNavigationQuest = [
  {
    title: '1. Campaign Info',
    url: TabEnum.SETUP
  },
  {
    title: '2. Quest Type',
    url: TabEnum.QUEST_TYPE
  },
  {
    title: '3. Reward',
    url: TabEnum.REWARD
  },
]

export {
  menuNavigationQuest
}