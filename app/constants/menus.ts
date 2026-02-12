import type { NavMenu, NavMenuItems } from '~/types/nav'

export const navMenu: NavMenu[] = [
  {
    heading: 'General',
    items: [
      {
        title: 'Home',
        icon: 'i-lucide-chart-area',
        link: '/',
      },
      // {
      //   title: 'Email',
      //   icon: 'i-lucide-mail',
      //   link: '/email',
      // },
      // {
      //   title: 'Tasks',
      //   icon: 'i-lucide-calendar-check-2',
      //   link: '/tasks',
      // },
    ],
  },
  {
    heading: 'Apps',
    items: [
      // {
      //   title: 'Task Board',
      //   icon: 'i-lucide-kanban',
      //   link: '/kanban',
      //   new: true,
      // },

      {
        title: 'Geo JSON',
        icon: 'i-lucide-map',
        new: true,
        children: [
          {
            title: 'IUP Boundary',
            icon: 'i-lucide-circle',
            link: '/gis/mine-iup',
          },
          // {
          //   title: 'Production',
          //   icon: 'i-lucide-circle',
          //   link: '/components/coa/analysis',
          // },
        ],
      },
    ],
  },

  {
    heading: 'Components',
    items: [
      {
        title: 'Inventory',
        icon: 'i-lucide-folder-input',
        new: false,
        children: [
          {
            title: 'Data All',
            icon: 'i-lucide-circle',
            link: '/components/inventory/data-all',
          },
          {
            title: 'Limonite',
            icon: 'i-lucide-circle',
            link: '/components/inventory/data-lim',
          },
          {
            title: 'Saprolite',
            icon: 'i-lucide-circle',
            link: '/components/inventory/data-sap',
          },
          {
            title: 'By Stockpile',
            icon: 'i-lucide-circle',
            link: '/components/inventory/data-stokpile',
          },
          // {
          //   title: 'Finish Inventory',
          //   icon: 'i-lucide-circle',
          //   link: '/components/inventory/finish-all',
          // },
          // {
          //   title: 'Finish Stockpile',
          //   icon: 'i-lucide-circle',
          //   link: '/components/inventory/finish-stokpile',
          // },
        ],
      },

      {
        title: 'Selling COA',
        icon: 'i-lucide-chart-line',
        new: false,
        children: [
          {
            title: 'Data',
            icon: 'i-lucide-circle',
            link: '/components/coa/official',
          },
          {
            title: 'Chart',
            icon: 'i-lucide-circle',
            link: '/components/coa/analysis',
          },
          {
            title: 'Monitoring',
            icon: 'i-lucide-circle',
            link: '/components/coa/monitoring',
          },

        ],
      },
      {
        title: 'Mining',
        icon: 'i-lucide-folder-clock',
        new: false,
        children: [
          {
            title: 'Fleet KPI',
            icon: 'i-lucide-circle',
            link: '/mining/unit-status',
          },
          {
            title: 'Daily Report',
            icon: 'i-lucide-circle',
            link: '/mining/daily-report',
          },
 

        ],
      },
      {
        title: 'Report',
        icon: 'i-lucide-cloud-download',
        new: false,
        children: [
          {
            title: 'Complile Data',
            icon: 'i-lucide-circle',
            link: '/report/compile',
          },
          {
            title: 'Export Data',
            icon: 'i-lucide-circle',
            link: '/report/export',
          },
          {
            title: 'Export COA',
            icon: 'i-lucide-circle',
            link: '/report/coa',
          },
        ],
      },
      {
        title: 'Settings',
        icon: 'i-lucide-settings',
        new: false,
        children: [
          {
            title: 'Profile',
            icon: 'i-lucide-circle',
            link: '/settings/profile',
          },
          {
            title: 'Account',
            icon: 'i-lucide-circle',
            link: '/settings/account',
          },
          {
            title: 'Appearance',
            icon: 'i-lucide-circle',
            link: '/settings/appearance',
          },
          {
            title: 'Notifications',
            icon: 'i-lucide-circle',
            link: '/settings/notifications',
          },
          // {
          //   title: 'Display',
          //   icon: 'i-lucide-circle',
          //   link: '/settings/display',
          // },
        ],
      },
    ],
  },

  // {
  //   heading: 'Pages',
  //   items: [
  //     {
  //       title: 'Authentication',
  //       icon: 'i-lucide-lock-keyhole-open',
  //       children: [
  //         {
  //           title: 'Login',
  //           icon: 'i-lucide-circle',
  //           link: '/login',
  //         },
  //         {
  //           title: 'Login Basic',
  //           icon: 'i-lucide-circle',
  //           link: '/login-basic',
  //         },
  //         {
  //           title: 'Register',
  //           icon: 'i-lucide-circle',
  //           link: '/register',
  //         },
  //         {
  //           title: 'Forgot Password',
  //           icon: 'i-lucide-circle',
  //           link: '/forgot-password',
  //         },
  //         {
  //           title: 'OTP',
  //           icon: 'i-lucide-circle',
  //           link: '/otp',
  //         },
  //         {
  //           title: 'OTP 1',
  //           icon: 'i-lucide-circle',
  //           link: '/otp-1',
  //         },
  //         {
  //           title: 'OTP 2',
  //           icon: 'i-lucide-circle',
  //           link: '/otp-2',
  //         },
  //       ],
  //     },
  //     {
  //       title: 'Errors',
  //       icon: 'i-lucide-triangle-alert',
  //       children: [
  //         {
  //           title: '401 - Unauthorized',
  //           icon: 'i-lucide-circle',
  //           link: '/401',
  //         },
  //         {
  //           title: '403 - Forbidden',
  //           icon: 'i-lucide-circle',
  //           link: '/403',
  //         },
  //         {
  //           title: '404 - Not Found',
  //           icon: 'i-lucide-circle',
  //           link: '/404',
  //         },
  //         {
  //           title: '500 - Internal Server Error',
  //           icon: 'i-lucide-circle',
  //           link: '/500',
  //         },
  //         {
  //           title: '503 - Service Unavailable',
  //           icon: 'i-lucide-circle',
  //           link: '/503',
  //         },
  //       ],
  //     },
  //     {
  //       title: 'Settings',
  //       icon: 'i-lucide-settings',
  //       new: true,
  //       children: [
  //         {
  //           title: 'Profile',
  //           icon: 'i-lucide-circle',
  //           link: '/settings/profile',
  //         },
  //         {
  //           title: 'Account',
  //           icon: 'i-lucide-circle',
  //           link: '/settings/account',
  //         },
  //         {
  //           title: 'Appearance',
  //           icon: 'i-lucide-circle',
  //           link: '/settings/appearance',
  //         },
  //         {
  //           title: 'Notifications',
  //           icon: 'i-lucide-circle',
  //           link: '/settings/notifications',
  //         },
  //         {
  //           title: 'Display',
  //           icon: 'i-lucide-circle',
  //           link: '/settings/display',
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   heading: 'Components',
  //   items: [
  //     {
  //       title: 'Components',
  //       icon: 'i-lucide-component',
  //       children: [
  //         {
  //           title: 'Accordion',
  //           icon: 'i-lucide-circle',
  //           link: '/components/accordion',
  //         },
  //         {
  //           title: 'Alert',
  //           icon: 'i-lucide-circle',
  //           link: '/components/alert',
  //         },
  //         {
  //           title: 'Alert Dialog',
  //           icon: 'i-lucide-circle',
  //           link: '/components/alert-dialog',
  //         },
  //         {
  //           title: 'Aspect Ratio',
  //           icon: 'i-lucide-circle',
  //           link: '/components/aspect-ratio',
  //         },
  //         {
  //           title: 'Avatar',
  //           icon: 'i-lucide-circle',
  //           link: '/components/avatar',
  //         },
  //         {
  //           title: 'Badge',
  //           icon: 'i-lucide-circle',
  //           link: '/components/badge',
  //         },
  //         {
  //           title: 'Breadcrumb',
  //           icon: 'i-lucide-circle',
  //           link: '/components/breadcrumb',
  //         },
  //         {
  //           title: 'Button',
  //           icon: 'i-lucide-circle',
  //           link: '/components/button',
  //         },
  //         {
  //           title: 'Calendar',
  //           icon: 'i-lucide-circle',
  //           link: '/components/calendar',
  //         },
  //         {
  //           title: 'Card',
  //           icon: 'i-lucide-circle',
  //           link: '/components/card',
  //         },
  //         {
  //           title: 'Carousel',
  //           icon: 'i-lucide-circle',
  //           link: '/components/carousel',
  //         },
  //         {
  //           title: 'Checkbox',
  //           icon: 'i-lucide-circle',
  //           link: '/components/checkbox',
  //         },
  //         {
  //           title: 'Collapsible',
  //           icon: 'i-lucide-circle',
  //           link: '/components/collapsible',
  //         },
  //         {
  //           title: 'Combobox',
  //           icon: 'i-lucide-circle',
  //           link: '/components/combobox',
  //         },
  //         {
  //           title: 'Command',
  //           icon: 'i-lucide-circle',
  //           link: '/components/command',
  //         },
  //         {
  //           title: 'Context Menu',
  //           icon: 'i-lucide-circle',
  //           link: '/components/context-menu',
  //         },
  //         {
  //           title: 'Dialog',
  //           icon: 'i-lucide-circle',
  //           link: '/components/dialog',
  //         },
  //         {
  //           title: 'Drawer',
  //           icon: 'i-lucide-circle',
  //           link: '/components/drawer',
  //         },
  //         {
  //           title: 'Dropdown Menu',
  //           icon: 'i-lucide-circle',
  //           link: '/components/dropdown-menu',
  //         },
  //         {
  //           title: 'Form',
  //           icon: 'i-lucide-circle',
  //           link: '/components/form',
  //         },
  //         {
  //           title: 'Hover Card',
  //           icon: 'i-lucide-circle',
  //           link: '/components/hover-card',
  //         },
  //         {
  //           title: 'Input',
  //           icon: 'i-lucide-circle',
  //           link: '/components/input',
  //         },
  //         {
  //           title: 'Item',
  //           icon: 'i-lucide-circle',
  //           link: '/components/item',
  //           new: true,
  //         },
  //         {
  //           title: 'kbd',
  //           icon: 'i-lucide-circle',
  //           link: '/components/kbd',
  //           new: true,
  //         },
  //         {
  //           title: 'Label',
  //           icon: 'i-lucide-circle',
  //           link: '/components/label',
  //         },
  //         {
  //           title: 'Menubar',
  //           icon: 'i-lucide-circle',
  //           link: '/components/menubar',
  //         },
  //         {
  //           title: 'Navigation Menu',
  //           icon: 'i-lucide-circle',
  //           link: '/components/navigation-menu',
  //         },
  //         {
  //           title: 'Number Field',
  //           icon: 'i-lucide-circle',
  //           link: '/components/number-field',
  //         },
  //         {
  //           title: 'Pagination',
  //           icon: 'i-lucide-circle',
  //           link: '/components/pagination',
  //         },
  //         {
  //           title: 'PIN Input',
  //           icon: 'i-lucide-circle',
  //           link: '/components/pin-input',
  //         },
  //         {
  //           title: 'Popover',
  //           icon: 'i-lucide-circle',
  //           link: '/components/popover',
  //         },
  //         {
  //           title: 'Progress',
  //           icon: 'i-lucide-circle',
  //           link: '/components/progress',
  //         },
  //         {
  //           title: 'Radio Group',
  //           icon: 'i-lucide-circle',
  //           link: '/components/radio-group',
  //         },
  //         {
  //           title: 'Range Calendar',
  //           icon: 'i-lucide-circle',
  //           link: '/components/range-calendar',
  //         },
  //         {
  //           title: 'Resizable',
  //           icon: 'i-lucide-circle',
  //           link: '/components/resizable',
  //         },
  //         {
  //           title: 'Scroll Area',
  //           icon: 'i-lucide-circle',
  //           link: '/components/scroll-area',
  //         },
  //         {
  //           title: 'Select',
  //           icon: 'i-lucide-circle',
  //           link: '/components/select',
  //         },
  //         {
  //           title: 'Separator',
  //           icon: 'i-lucide-circle',
  //           link: '/components/separator',
  //         },
  //         {
  //           title: 'Sheet',
  //           icon: 'i-lucide-circle',
  //           link: '/components/sheet',
  //         },
  //         {
  //           title: 'Skeleton',
  //           icon: 'i-lucide-circle',
  //           link: '/components/skeleton',
  //         },
  //         {
  //           title: 'Slider',
  //           icon: 'i-lucide-circle',
  //           link: '/components/slider',
  //         },
  //         {
  //           title: 'Sonner',
  //           icon: 'i-lucide-circle',
  //           link: '/components/sonner',
  //         },
  //         {
  //           title: 'Stepper',
  //           icon: 'i-lucide-circle',
  //           link: '/components/stepper',
  //         },
  //         {
  //           title: 'Switch',
  //           icon: 'i-lucide-circle',
  //           link: '/components/switch',
  //         },
  //         {
  //           title: 'Table',
  //           icon: 'i-lucide-circle',
  //           link: '/components/table',
  //         },
  //         {
  //           title: 'Tabs',
  //           icon: 'i-lucide-circle',
  //           link: '/components/tabs',
  //         },
  //         {
  //           title: 'Tags Input',
  //           icon: 'i-lucide-circle',
  //           link: '/components/tags-input',
  //         },
  //         {
  //           title: 'Textarea',
  //           icon: 'i-lucide-circle',
  //           link: '/components/textarea',
  //         },
  //         {
  //           title: 'Toast',
  //           icon: 'i-lucide-circle',
  //           link: '/components/toast',
  //         },
  //         {
  //           title: 'Toggle',
  //           icon: 'i-lucide-circle',
  //           link: '/components/toggle',
  //         },
  //         {
  //           title: 'Toggle Group',
  //           icon: 'i-lucide-circle',
  //           link: '/components/toggle-group',
  //         },
  //         {
  //           title: 'Tooltip',
  //           icon: 'i-lucide-circle',
  //           link: '/components/tooltip',
  //         },
  //       ],
  //     },
  //   ],
  // },
]

export const navMenuBottom: NavMenuItems = [
  {
    title: 'Help & Support',
    icon: 'i-lucide-circle-help',
    link: 'https://github.com/21bria',
  },
  // {
  //   title: 'Feedback',
  //   icon: 'i-lucide-send',
  //   link: 'https://github.com/21bria',
  // },
]
