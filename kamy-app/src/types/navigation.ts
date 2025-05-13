import type { RouteProp } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"

// Auth Stack
export type AuthStackParamList = {
  Welcome: undefined
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
}

// Home Stack
export type HomeStackParamList = {
  HomeMain: undefined
  GroupDetails: { groupId: string; groupName: string }
  TaskDetails: { taskId: string; groupId: string }
  CreateTask: { groupId: string; groupName: string }
  GroupMembers: { groupId: string; groupName: string }
  AddMember: { groupId: string; groupName: string }
}

// Groups Stack
export type GroupsStackParamList = {
  GroupsMain: undefined
  CreateGroup: undefined
  GroupDetails: { groupId: string; groupName: string }
  TaskDetails: { taskId: string; groupId: string }
  CreateTask: { groupId: string; groupName: string }
  GroupMembers: { groupId: string; groupName: string }
  AddMember: { groupId: string; groupName: string }
}

// Notifications Stack
export type NotificationsStackParamList = {
  NotificationsMain: undefined
  GroupDetails: { groupId: string; groupName: string }
  TaskDetails: { taskId: string; groupId: string }
}

// Profile Stack
export type ProfileStackParamList = {
  ProfileMain: undefined
  EditProfile: undefined
  Settings: undefined
}

// Main Tab
export type MainTabParamList = {
  Home: undefined
  Groups: undefined
  Notifications: undefined
  Profile: undefined
}

// Navigation Props
export type AuthScreenNavigationProp<T extends keyof AuthStackParamList> = StackNavigationProp<AuthStackParamList, T>
export type HomeScreenNavigationProp<T extends keyof HomeStackParamList> = StackNavigationProp<HomeStackParamList, T>
export type GroupsScreenNavigationProp<T extends keyof GroupsStackParamList> = StackNavigationProp<
  GroupsStackParamList,
  T
>
export type NotificationsScreenNavigationProp<T extends keyof NotificationsStackParamList> = StackNavigationProp<
  NotificationsStackParamList,
  T
>
export type ProfileScreenNavigationProp<T extends keyof ProfileStackParamList> = StackNavigationProp<
  ProfileStackParamList,
  T
>

// Route Props
export type AuthScreenRouteProp<T extends keyof AuthStackParamList> = RouteProp<AuthStackParamList, T>
export type HomeScreenRouteProp<T extends keyof HomeStackParamList> = RouteProp<HomeStackParamList, T>
export type GroupsScreenRouteProp<T extends keyof GroupsStackParamList> = RouteProp<GroupsStackParamList, T>
export type NotificationsScreenRouteProp<T extends keyof NotificationsStackParamList> = RouteProp<
  NotificationsStackParamList,
  T
>
export type ProfileScreenRouteProp<T extends keyof ProfileStackParamList> = RouteProp<ProfileStackParamList, T>
