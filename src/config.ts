export const HOUSE_ID = "6f67fe2a-bb29-44ba-b4d9-bf50eda4ac78";

export const USER_LABELS : Record<string, string> = {
  "3547a8d5-4ceb-4cef-adcf-5149dad5a96c" : "Sid",
  "7f8200b1-dc35-474e-816c-9f0084d570fa" : "Diego",
  "8dd3db38-59b2-469f-a27d-02a3f6be95bd" : "Clyde",
  "f4e347a8-27db-429b-9cf6-b53eae6158f7" : "Tanure",
}

export const USER_TO_NEXT : Record<string, string> = {
  // Sid -> Tanure
  "3547a8d5-4ceb-4cef-adcf-5149dad5a96c" : "f4e347a8-27db-429b-9cf6-b53eae6158f7",
  // Diego -> Sid
  "7f8200b1-dc35-474e-816c-9f0084d570fa" : "3547a8d5-4ceb-4cef-adcf-5149dad5a96c",
  // Clyde -> Diego
  "8dd3db38-59b2-469f-a27d-02a3f6be95bd" : "7f8200b1-dc35-474e-816c-9f0084d570fa",
  // Tanure -> Clyde
  "f4e347a8-27db-429b-9cf6-b53eae6158f7" : "8dd3db38-59b2-469f-a27d-02a3f6be95bd",
}