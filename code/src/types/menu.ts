// 菜单项类型
export interface MenuItem {
  path: string
  name: string
  icon?: string
  title: string
  children?: MenuItem[]
} 