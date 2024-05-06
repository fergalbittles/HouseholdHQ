<template>
  <div>
    <h1
      id="page_heading"
      class="w-[90%] text-white text-h4 mt-7 block mx-auto font-medium"
    >
      Bills
    </h1>

    <p class="w-[90%] mx-auto text-white font-light">
      This feature has not been implemented yet
    </p>

    <v-card
      title="Bills"
      subtitle="This feature will include the following:"
      class="w-[90%] mx-auto mt-6 mb-16 rounded-lg !shadow-2xl"
    >
      <ul class="pl-9 pr-4 mb-4 list-disc">
        <li class="mb-4">
          This page will show a list of recurring household costs and one-time expenses, such as
          Wi-Fi, utility, and shopping bills.
        </li>
        <li class="mb-4">
          If the status of a bill is not updated to "Paid" before the specified due date,
          then it will be become "Overdue".
        </li>
        <li class="mb-10">
          Household members will have the ability to specify a split cost of a bill. For example,
          a monthly utility bill might be divided between all members of a household, while a one-time
          expense might only be split between two members of a household.
        </li>
      </ul>
    </v-card>
  </div>
</template>
