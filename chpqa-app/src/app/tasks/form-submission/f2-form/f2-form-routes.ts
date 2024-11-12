import { Routes } from '@angular/router';
import { F2FormPath } from './models/f2-form-path.model';

export const F2_FORM_ROUTES: Routes = [
  // {
  //   path: ':taskId',
  //   children: [
  {
    path: F2FormPath.REVIEW_ADDRESS_AND_SITE_CONTACT,
    loadComponent: () =>
      import(
        './sub-tasks/review-address-and-site-contact/review-address-and-site-contact.component'
      ).then(mod => mod.ReviewAddressAndSiteContactComponent),
  },
  {
    path: F2FormPath.UPLOAD_ENERGY_FLOW_DIAGRAM,
    loadComponent: () =>
      import(
        './sub-tasks/energy-flow-diagram/upload-energy-flow-diagram/upload-energy-flow-diagram.component'
      ).then(mod => mod.UploadEnergyFlowDiagramComponent),
  },
  {
    path: F2FormPath.ENERGY_FLOW_DIAGRAM_SUMMARY,
    loadComponent: () =>
      import('./sub-tasks/energy-flow-diagram/summary/summary.component').then(
        mod => mod.SummaryComponent
      ),
  },
  {
    path: F2FormPath.UPLOAD_ANNUAL_HEAT_PROFILE,
    loadComponent: () =>
      import(
        './sub-tasks/annual-heat-profile/upload-annual-heat-profile/upload-annual-heat-profile.component'
      ).then(mod => mod.UploadAnnualHeatProfileComponent),
  },
  {
    path: F2FormPath.ANNUAL_HEAT_PROFILE_SUMMARY,
    loadComponent: () =>
      import('./sub-tasks/annual-heat-profile/summary/summary.component').then(
        mod => mod.SummaryComponent
      ),
  },
  {
    path: F2FormPath.UPLOAD_DAILY_HEAT_PROFILE,
    loadComponent: () =>
      import(
        './sub-tasks/daily-heat-profile/upload-daily-heat-profile/upload-daily-heat-profile.component'
      ).then(mod => mod.UploadDailyHeatProfileComponent),
  },
  {
    path: F2FormPath.DAILY_HEAT_PROFILE_SUMMARY,
    loadComponent: () =>
      import('./sub-tasks/daily-heat-profile/summary/summary.component').then(
        mod => mod.SummaryComponent
      ),
  },
  {
    path: F2FormPath.UPLOAD_HEAT_LOAD_DURATION_CURVE,
    loadComponent: () =>
      import(
        './sub-tasks/heat-load-duration-curve/upload-heat-load-duration-curve/upload-heat-load-duration-curve.component'
      ).then(mod => mod.UploadHeatLoadDurationCurveComponent),
  },
  {
    path: F2FormPath.HEAT_LOAD_DURATION_CURVE_SUMMARY,
    loadComponent: () =>
      import('./sub-tasks/heat-load-duration-curve/summary/summary.component').then(
        mod => mod.SummaryComponent
      ),
  },
  {
    path: F2FormPath.ADD_PRIME_MOVER,
    loadComponent: () =>
      import(
        './sub-tasks/prime-mover/components/add-prime-mover/add-prime-mover.component'
      ).then(mod => mod.AddPrimeMoverComponent),
  },
  {
    path: F2FormPath.PRIME_MOVER_ENGINE,
    loadComponent: () =>
      import(
        './sub-tasks/prime-mover/components/prime-mover-engine/prime-mover-engine.component'
      ).then(mod => mod.PrimeMoverEngineComponent),
  },
  {
    path: F2FormPath.PRIME_MOVER_DOCUMENTATION,
    loadComponent: () =>
      import(
        './sub-tasks/prime-mover/components/prime-mover-documentation/prime-mover-documentation.component'
      ).then(mod => mod.PrimeMoverDocumentationComponent),
  },
  {
    path: F2FormPath.PRIME_MOVER_ENGINE_MANUFACTURER,
    loadComponent: () =>
      import(
        './sub-tasks/prime-mover/components/prime-mover-engine-manufacturer/prime-mover-engine-manufacturer.component'
      ).then(mod => mod.PrimeMoverEngineManufacturerComponent),
  },
  {
    path: F2FormPath.PRIME_MOVER_ENGINE_MODEL,
    loadComponent: () =>
      import(
        './sub-tasks/prime-mover/components/prime-mover-engine-model/prime-mover-engine-model.component'
      ).then(mod => mod.PrimeMoverEngineModelComponent),
  },
  {
    path: F2FormPath.PRIME_MOVER_MECHANICAL_LOAD,
    loadComponent: () =>
      import(
        './sub-tasks/prime-mover/components/prime-mover-mechanical-load/prime-mover-mechanical-load.component'
      ).then(mod => mod.PrimeMoverMechanicalLoadComponent),
  },
  {
    path: F2FormPath.PRIME_MOVER_ENGINE_TYPE,
    loadComponent: () =>
      import(
        './sub-tasks/prime-mover/components/prime-mover-type/prime-mover-type.component'
      ).then(mod => mod.PrimeMoverTypeComponent),
  },
  {
    path: F2FormPath.PRIME_MOVER_ENGINE_SUBTYPE,
    loadComponent: () =>
      import(
        './sub-tasks/prime-mover/components/prime-mover-subtype/prime-mover-subtype.component'
      ).then(mod => mod.PrimeMoverSubtypeComponent),
  },
  {
    path: F2FormPath.PRIME_MOVER_REVIEW_ANSWERS,
    loadComponent: () =>
      import(
        './sub-tasks/prime-mover/components/prime-mover-review-answers/prime-mover-review-answers.component'
      ).then(mod => mod.PrimeMoverReviewAnswersComponent),
  },
  {
    path: F2FormPath.ADD_METER,
    loadComponent: () =>
      import(
        './sub-tasks/meter-details/components/add-meter/add-meter.component'
      ).then(mod => mod.AddMeterComponent),
  },
  {
    path: F2FormPath.METER_EXISTENCE,
    loadComponent: () =>
      import(
        './sub-tasks/meter-details/components/meter-existence/meter-existence.component'
      ).then(mod => mod.MeterExistenceComponent),
  },
  {
    path: F2FormPath.METER_OUTPUT_RANGE,
    loadComponent: () =>
      import(
        './sub-tasks/meter-details/components/meter-output-range/meter-output-range.component'
      ).then(mod => mod.MeterOutputRangeComponent),
  },
  {
    path: F2FormPath.METER_PRIMARY_CHECK,
    loadComponent: () =>
      import(
        './sub-tasks/meter-details/components/meter-fiscal-check/meter-fiscal-check.component'
      ).then(mod => mod.MeterFiscalCheckComponent),
  },
  {
    path: F2FormPath.METER_PRIMARY_CHECK,
    loadComponent: () =>
      import(
        './sub-tasks/meter-details/components/meter-fiscal-check/meter-fiscal-check.component'
      ).then(mod => mod.MeterFiscalCheckComponent),
  },
  {
    path: F2FormPath.METER_SUBTYPE,
    loadComponent: () =>
      import(
        './sub-tasks/meter-details/components/meter-type/meter-type.component'
      ).then(mod => mod.MeterTypeComponent),
  },
  {
    path: F2FormPath.METER_UNCERTAINTY,
    loadComponent: () =>
      import(
        './sub-tasks/meter-details/components/meter-uncertainty/meter-uncertainty.component'
      ).then(mod => mod.MeterUncertaintyComponent),
  },
  {
    path: F2FormPath.METER_DOCUMENTATION,
    loadComponent: () =>
      import(
        './sub-tasks/meter-details/components/meter-documentation/meter-documentation.component'
      ).then(mod => mod.MeterDocumentationComponent),
  },
  {
    path: F2FormPath.METER_REVIEW_ANSWERS,
    loadComponent: () =>
      import(
        './sub-tasks/meter-details/components/summary/summary.component'
      ).then(mod => mod.SummaryComponent),
  },
  
  // ],
  //},
];
