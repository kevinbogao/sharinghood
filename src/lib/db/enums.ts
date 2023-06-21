import { ItemConditionEnum, TimeFrameEnum } from "@prisma/client";

export const ITEM_CONDITION: Record<ItemConditionEnum, string> = {
  [ItemConditionEnum.NEW]: "New",
  [ItemConditionEnum.USED]: "Used but good",
  [ItemConditionEnum.DAMAGED]: "Used but little damaged",
};

export const TIME_FRAME: Record<TimeFrameEnum, string> = {
  [TimeFrameEnum.ASAP]: "ASAP",
  [TimeFrameEnum.RANDOM]: "Anytime",
  [TimeFrameEnum.SPECIFIC]: "Specific Time",
};
