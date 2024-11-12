import { ReplySchemeForAssessor } from "src/app/api-services/chpqa-api/generated";

export const mockAssessorDashboardResponse: ReplySchemeForAssessor[] = Array.from({ length: 50 }, (_, index) => ({
  id: `3fa85f64-5717-4562-b3fc-2c963f66af${index + 1}`,
  name: `Scheme${String.fromCharCode(65 + (index % 26))}${index + 1}`,
  reference: `1111${String.fromCharCode(65 + (index % 26))}`,
  createdon: new Date().toISOString(),
  status: index % 5,
  latestSubmissionStatus: index % 3,
  statusText: ['Awaiting assessment', 'Approved', 'In progress', 'Awaiting validation', 'Rejected'][index % 5],
  company: {
    id: `3fa85f64-5717-4562-b3fc-2c963f66af${index + 1}`,
    name: `Company ${String.fromCharCode(65 + (index % 26))}`,
    registrationNumber: `Reg${String.fromCharCode(65 + (index % 26))}${index + 1}`,
    address1: `Address1-${index + 1}`,
    address2: `Address2-${index + 1}`,
    town: `Town${String.fromCharCode(65 + (index % 26))}`,
    county: `County${String.fromCharCode(65 + (index % 26))}`,
    postcode: `Postcode${index + 1}`
  },
  responsiblePerson: {
    id: `3fa85f64-5717-4562-b3fc-2c963f66af${index + 1}`,
    username: `user${String.fromCharCode(65 + (index % 26))}`,
    firstName: `First${String.fromCharCode(65 + (index % 26))}`,
    lastName: `Last${String.fromCharCode(65 + (index % 26))}`,
    email: `email${String.fromCharCode(65 + (index % 26))}@example.com`,
    telephone1: `12345${index + 1}`,
    telephone2: `67890${index + 1}`
  },
  site: {
    id: `3fa85f64-5717-4562-b3fc-2c963f66af${index + 1}`,
    name: `Site${String.fromCharCode(65 + (index % 26))}`,
    address1: `SiteAddress1-${index + 1}`,
    address2: `SiteAddress2-${index + 1}`,
    postcode: `SitePostcode${index + 1}`,
    town: `SiteTown${String.fromCharCode(65 + (index % 26))}`,
    county: `SiteCounty${String.fromCharCode(65 + (index % 26))}`
  },
  assessor: {
    id: `3fa85f64-5717-4562-b3fc-2c963f66af${index + 1}`,
    firstName: `Assessor${String.fromCharCode(65 + (index % 26))}`,
    lastName: `Last${String.fromCharCode(65 + (index % 26))}`,
    email: `assessor${String.fromCharCode(65 + (index % 26))}@example.com`
  }
}));
