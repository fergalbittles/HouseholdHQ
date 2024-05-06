import AppAuthentication from "../components/Authentication/AppAuthentication.vue";
import AppHousehold from "../components/Household/AppHousehold.vue";
import LandingScreen from "../components/Landing/LandingScreen.vue";
import ChoresDashboard from "../components/Views/ChoresDashboard.vue";
import ChoreDetails from "../components/Views/ChoreDetails.vue";
import HouseholdDashboard from "../components/Views/HouseholdDashboard.vue";
import NotificationDashboard from "../components/Views/NotificationDashboard.vue";
import ShoppingListDashboard from "../components/Views/ShoppingListDashboard.vue";
import BillsDashboard from "../components/Views/BillsDashboard.vue";
import ActivitiesDashboard from "../components/Views/ActivitiesDashboard.vue";
import RequestsDashboard from "../components/Views/RequestsDashboard.vue";
import DiscussionsDashboard from "../components/Views/DiscussionsDashboard.vue";
import UserDashboard from "../components/Views/UserDashboard.vue";
import { createWebHistory, createRouter } from "vue-router";

const routes = [
    {
        path: "/welcome",
        name: "welcome",
        component: LandingScreen,
        children: [
            {
                path: "account",
                name: "account",
                component: AppAuthentication,
            },
            {
                path: "household",
                name: "household",
                component: AppHousehold,
            },
        ],
    },
    {
        path: "/",
        name: "home",
        component: HouseholdDashboard,
    },
    {
        path: "/chores",
        name: "chores",
        component: ChoresDashboard,
        children: [
            {
                path: ":id",
                name: "chore",
                component: ChoreDetails,
            },
        ],
    },
    {
        path: "/notifications",
        name: "notifications",
        component: NotificationDashboard,
    },
    {
        path: "/shoppinglist",
        name: "shopping",
        component: ShoppingListDashboard,
    },
    {
        path: "/bills",
        name: "bills",
        component: BillsDashboard,
    },
    {
        path: "/activities",
        name: "activities",
        component: ActivitiesDashboard,
    },
    {
        path: "/requests",
        name: "requests",
        component: RequestsDashboard,
    },
    {
        path: "/discussions",
        name: "discussions",
        component: DiscussionsDashboard,
    },
    {
        path: "/profile",
        name: "profile",
        component: UserDashboard,
    },
    { path: "/:catchAll(.*)", redirect: "/" },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
