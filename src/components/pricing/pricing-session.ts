import type { Dispatch, SetStateAction } from "react";

import type { CustomerType } from "@/domain/customers/types";
import type { PricingLineInput } from "@/domain/pricing/types";

export type PricingSession = {
  customerType: CustomerType;
  isFirstOrderOfMonth: boolean;
  expressDelivery: boolean;
  lines: PricingLineInput[];
};

export type PricingSessionSetters = {
  setCustomerType: Dispatch<SetStateAction<CustomerType>>;
  setIsFirstOrderOfMonth: Dispatch<SetStateAction<boolean>>;
  setExpressDelivery: Dispatch<SetStateAction<boolean>>;
  setLines: Dispatch<SetStateAction<PricingLineInput[]>>;
};
