import {
  IconBoxMultiple, IconCircleDot,IconListTree, IconHome, IconInfoCircle, IconLayout, IconLayoutGrid, IconList, IconPhoto, IconPoint, IconStar, IconTable, IconUser,
  IconBrandWindows,
  IconCategory
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconHome,
    href: "/",
  },
  {
    id: uniqueId(),
    title: "Admins",
    icon: IconListTree,
    href: "/cpanel/admin"
  },
  {
    id: uniqueId(),
    title: "Platforms",
    icon: IconBrandWindows,
    href: "/cpanel/admin/platforms"
  },
  {
    id: uniqueId(),
    title: "Categories",
    icon: IconCategory,
    href: "/cpanel/admin/categories"
  },
  {
    id: uniqueId(),
    title: "Buttons",
    icon: IconCircleDot,
    href: "/ui-components/buttons",
  },
  {
    id: uniqueId(),
    title: "Forms",
    icon: IconTable,
    href: "/ui-components/forms",
  },
  {
    id: uniqueId(),
    title: "Alerts",
    icon: IconInfoCircle,
    href: "/ui-components/alerts",
  },
  {
    id: uniqueId(),
    title: "Ratings",
    icon: IconStar,
    href: "/ui-components/ratings",
  },
  {
    id: uniqueId(),
    title: "Images",
    icon: IconPhoto,
    href: "/ui-components/images",
  },
  {
    id: uniqueId(),
    title: "Pagination",
    icon: IconUser,
    href: "/ui-components/pagination",
  },
  {
    id: uniqueId(),
    title: "Tables",
    icon: IconLayoutGrid,
    href: "/ui-components/table",
  },
];

export default Menuitems;
