import { Routes } from '@angular/router';
import { SubmissionGroupType } from '@shared/enums/form-submission.enum';
import { CanNavigateToSubmissionReviewScreenGuard } from '@shared/guards/submission-section-review-screen.guard';
import { canActivateTaskListPage, canDeactivateTaskListPage } from './components/task-list/task-list.gurad';
import { FormSubmissionPath } from './model/form-submission-path.model';
import { primeMoversGuard } from './f2-form/sub-tasks/prime-mover/components/add-prime-mover/add-prime-mover.guard';
import { metersGuard } from './f2-form/sub-tasks/meter-details/components/add-meter/add-meter.guard';

export const FORM_SUBMISSION_ROUTES: Routes = [
  {
    path: ':submissionFormId',
    canActivate: [canActivateTaskListPage],
    canDeactivate: [canDeactivateTaskListPage],
    children: [
      {
        path: FormSubmissionPath.TASK_LIST,
        loadComponent: () => import('./components/task-list/task-list.component').then(mod => mod.TaskListComponent),
      },
      {
        path: FormSubmissionPath.SCHEME_HISTORY,
        loadComponent: () => import('./components/scheme-history/scheme-history.component').then(mod => mod.SchemeHistoryComponent),
      },
      {
        path: FormSubmissionPath.REVIEW_ADDRESS_AND_SITE_CONTACT,
        loadComponent: () =>
          import('./f2-form/sub-tasks/review-address-and-site-contact/review-address-and-site-contact.component').then(
            mod => mod.ReviewAddressAndSiteContactComponent
          ),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.ReviewRpAndSiteContact, // groupType: 0
        },
      },
      {
        path: FormSubmissionPath.UPLOAD_SCHEME_LINE_DIAGRAM,
        loadComponent: () =>
          import('./f2-form/sub-tasks/scheme-line-diagram/upload-scheme-line-diagram/upload-scheme-line-diagram.component').then(
            mod => mod.UploadSchemeLineDiagramComponent
          ),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.UploadSchemeLineDiagram, // groupType: 1
        },
      },
      {
        path: FormSubmissionPath.SCHEME_LINE_DIAGRAM_SUMMARY,
        loadComponent: () => import('./f2-form/sub-tasks/scheme-line-diagram/summary/summary.component').then(mod => mod.SummaryComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.UploadSchemeLineDiagram, // groupType: 1
        },
      },
      {
        path: FormSubmissionPath.UPLOAD_ENERGY_FLOW_DIAGRAM,
        loadComponent: () =>
          import('./f2-form/sub-tasks/energy-flow-diagram/upload-energy-flow-diagram/upload-energy-flow-diagram.component').then(
            mod => mod.UploadEnergyFlowDiagramComponent
          ),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.UploadEnergyFlowDiagram, // groupType: 2
        },
      },
      {
        path: FormSubmissionPath.ENERGY_FLOW_DIAGRAM_SUMMARY,
        loadComponent: () => import('./f2-form/sub-tasks/energy-flow-diagram/summary/summary.component').then(mod => mod.SummaryComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.UploadEnergyFlowDiagram, // groupType: 2
        },
      },
      {
        path: FormSubmissionPath.UPLOAD_DAILY_HEAT_PROFILE,
        loadComponent: () =>
          import('./f2-form/sub-tasks/daily-heat-profile/upload-daily-heat-profile/upload-daily-heat-profile.component').then(
            mod => mod.UploadDailyHeatProfileComponent
          ),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.UploadDailyHeatProfile, // groupType: 4
        },
      },
      {
        path: FormSubmissionPath.DAILY_HEAT_PROFILE_SUMMARY,
        loadComponent: () => import('./f2-form/sub-tasks/daily-heat-profile/summary/summary.component').then(mod => mod.SummaryComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.UploadDailyHeatProfile, // groupType: 4
        },
      },
      {
        path: FormSubmissionPath.UPLOAD_ANNUAL_HEAT_PROFILE,
        loadComponent: () =>
          import('./f2-form/sub-tasks/annual-heat-profile/upload-annual-heat-profile/upload-annual-heat-profile.component').then(
            mod => mod.UploadAnnualHeatProfileComponent
          ),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.UploadAnnualHeatProfile, // groupType: 3
        },
      },
      {
        path: FormSubmissionPath.ANNUAL_HEAT_PROFILE_SUMMARY,
        loadComponent: () => import('./f2-form/sub-tasks/annual-heat-profile/summary/summary.component').then(mod => mod.SummaryComponent),
      },
      {
        path: FormSubmissionPath.UPLOAD_HEAT_LOAD_DURATION_CURVE,
        loadComponent: () =>
          import('./f2-form/sub-tasks/heat-load-duration-curve/upload-heat-load-duration-curve/upload-heat-load-duration-curve.component').then(
            mod => mod.UploadHeatLoadDurationCurveComponent
          ),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.UploadHeatLoadDurationCurve, // groupType: 5
        },
      },
      {
        path: FormSubmissionPath.HEAT_LOAD_DURATION_CURVE_SUMMARY,
        loadComponent: () => import('./f2-form/sub-tasks/heat-load-duration-curve/summary/summary.component').then(mod => mod.SummaryComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.UploadHeatLoadDurationCurve, // groupType: 5
        },
      },
      {
        path: FormSubmissionPath.SET_TOTAL_CAPACITY_UNDER_MAXHEAT_CONDITIONS,
        loadComponent: () =>
          import(
            './f2-form/sub-tasks/total-power-capacity-under-maxheat/components/set-total-power-capacity-under-maxheat/set-total-power-capacity-under-maxheat.component'
          ).then(mod => mod.SetTotalPowerCapacityUnderMaxHeatComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.TotalPowerCapUnderMaxHeatConditions, // groupType: 17
        },
      },
      {
        path: FormSubmissionPath.TOTAL_CAPACITY_UNDER_MAXHEAT_CONDITIONS_SUMMARY,
        loadComponent: () =>
          import('./f2-form/sub-tasks/total-power-capacity-under-maxheat/components/summary/summary.component').then(
            mod => mod.TotalPowerCapacityUnderMaxHeatSummaryComponent
          ),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.TotalPowerCapUnderMaxHeatConditions, // groupType: 17
        },
      },
      {
        path: FormSubmissionPath.ADD_PRIME_MOVER,
        loadComponent: () =>
          import('./f2-form/sub-tasks/prime-mover/components/add-prime-mover/add-prime-mover.component').then(mod => mod.AddPrimeMoverComponent),
        canActivate: [primeMoversGuard, CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.AddPrimeMoverDetails, // groupType: 6
        },
      },
      {
        path: FormSubmissionPath.PRIME_MOVER_ENGINE,
        loadComponent: () =>
          import('./f2-form/sub-tasks/prime-mover/components/prime-mover-engine/prime-mover-engine.component').then(mod => mod.PrimeMoverEngineComponent),
        canActivate: [],
        data: {
          sectionId: SubmissionGroupType.AddPrimeMoverDetails, // groupType: 6
        },
      },
      {
        path: FormSubmissionPath.PRIME_MOVER_DOCUMENTATION,
        loadComponent: () =>
          import('./f2-form/sub-tasks/prime-mover/components/prime-mover-documentation/prime-mover-documentation.component').then(
            mod => mod.PrimeMoverDocumentationComponent
          ),
        canActivate: [],
        data: {
          sectionId: SubmissionGroupType.AddPrimeMoverDetails, // groupType: 6
        },
      },
      {
        path: FormSubmissionPath.PRIME_MOVER_ENGINE_MANUFACTURER,
        loadComponent: () =>
          import('./f2-form/sub-tasks/prime-mover/components/prime-mover-engine-manufacturer/prime-mover-engine-manufacturer.component').then(
            mod => mod.PrimeMoverEngineManufacturerComponent
          ),
        canActivate: [],
        data: {
          sectionId: SubmissionGroupType.AddPrimeMoverDetails, // groupType: 6
        },
      },
      {
        path: FormSubmissionPath.PRIME_MOVER_ENGINE_MODEL,
        loadComponent: () =>
          import('./f2-form/sub-tasks/prime-mover/components/prime-mover-engine-model/prime-mover-engine-model.component').then(
            mod => mod.PrimeMoverEngineModelComponent
          ),
        canActivate: [],
        data: {
          sectionId: SubmissionGroupType.AddPrimeMoverDetails, // groupType: 6
        },
      },
      {
        path: FormSubmissionPath.PRIME_MOVER_MECHANICAL_LOAD,
        loadComponent: () =>
          import('./f2-form/sub-tasks/prime-mover/components/prime-mover-mechanical-load/prime-mover-mechanical-load.component').then(
            mod => mod.PrimeMoverMechanicalLoadComponent
          ),
        canActivate: [],
        data: {
          sectionId: SubmissionGroupType.AddPrimeMoverDetails, // groupType: 6
        },
      },
      {
        path: FormSubmissionPath.PRIME_MOVER_ENGINE_TYPE,
        loadComponent: () =>
          import('./f2-form/sub-tasks/prime-mover/components/prime-mover-type/prime-mover-type.component').then(mod => mod.PrimeMoverTypeComponent),
        canActivate: [],
        data: {
          sectionId: SubmissionGroupType.AddPrimeMoverDetails, // groupType: 6
        },
      },
      {
        path: FormSubmissionPath.PRIME_MOVER_ENGINE_SUBTYPE,
        loadComponent: () =>
          import('./f2-form/sub-tasks/prime-mover/components/prime-mover-subtype/prime-mover-subtype.component').then(mod => mod.PrimeMoverSubtypeComponent),
        canActivate: [],
        data: {
          sectionId: SubmissionGroupType.AddPrimeMoverDetails, // groupType: 6
        },
      },
      {
        path: FormSubmissionPath.PRIME_MOVER_FIGURES,
        loadComponent: () =>
          import('./f2-form/sub-tasks/prime-mover/components/prime-mover-figures/prime-mover-figures.component').then(mod => mod.PrimeMoverFiguresComponent),
        canActivate: [],
        data: {
          sectionId: SubmissionGroupType.AddPrimeMoverDetails, // groupType: 6
        },
      },
      {
        path: FormSubmissionPath.PRIME_MOVER_REVIEW_ANSWERS,
        loadComponent: () =>
          import('./f2-form/sub-tasks/prime-mover/components/prime-mover-review-answers/prime-mover-review-answers.component').then(
            mod => mod.PrimeMoverReviewAnswersComponent
          ),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.AddPrimeMoverDetails, // groupType: 6
        },
      },
      {
        path: FormSubmissionPath.PRIME_MOVER_CONFIRM_DELETION,
        loadComponent: () =>
          import('./f2-form/sub-tasks/prime-mover/components/confirm-delete-prime-mover/confirm-delete-prime-mover.component').then(
            mod => mod.ConfirmDeletePrimeMoverComponent
          ),
        canActivate: [],
        data: {
          sectionId: SubmissionGroupType.AddPrimeMoverDetails, // groupType: 6
        },
      },
      {
        path: FormSubmissionPath.ADD_METER,
        loadComponent: () => import('./f2-form/sub-tasks/meter-details/components/add-meter/add-meter.component').then(mod => mod.AddMeterComponent),
        canActivate: [metersGuard, CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.AddMeterDetails, // groupType: 7
        },
      },
      {
        path: FormSubmissionPath.METER_EXISTENCE,
        loadComponent: () =>
          import('./f2-form/sub-tasks/meter-details/components/meter-existence/meter-existence.component').then(mod => mod.MeterExistenceComponent),
        canActivate: [],
        data: {
          sectionId: SubmissionGroupType.AddMeterDetails, // groupType: 7
        },
      },
      {
        path: FormSubmissionPath.METER_OUTPUT_RANGE,
        loadComponent: () =>
          import('./f2-form/sub-tasks/meter-details/components/meter-output-range/meter-output-range.component').then(mod => mod.MeterOutputRangeComponent),
        canActivate: [],
        data: {
          sectionId: SubmissionGroupType.AddMeterDetails, // groupType: 7
        },
      },
      {
        path: FormSubmissionPath.METER_FISCAL_CHECK,
        loadComponent: () =>
          import('./f2-form/sub-tasks/meter-details/components/meter-fiscal-check/meter-fiscal-check.component').then(mod => mod.MeterFiscalCheckComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.AddMeterDetails, // groupType: 7
        },
      },
      {
        path: FormSubmissionPath.METER_TYPE,
        loadComponent: () => import('./f2-form/sub-tasks/meter-details/components/meter-type/meter-type.component').then(mod => mod.MeterTypeComponent),
        canActivate: [],
        data: {
          sectionId: SubmissionGroupType.AddMeterDetails, // groupType: 7
        },
      },
      {
        path: FormSubmissionPath.METER_UNCERTAINTY,
        loadComponent: () =>
          import('./f2-form/sub-tasks/meter-details/components/meter-uncertainty/meter-uncertainty.component').then(mod => mod.MeterUncertaintyComponent),
        canActivate: [],
        data: {
          sectionId: SubmissionGroupType.AddMeterDetails, // groupType: 7
        },
      },
      {
        path: FormSubmissionPath.METER_MEASUREMENT,
        loadComponent: () =>
          import('./f2-form/sub-tasks/meter-details/components/meter-measurement/meter-measurement.component').then(mod => mod.MeterMeasurementComponent),
        canActivate: [],
        data: {
          sectionId: SubmissionGroupType.AddMeterDetails, // groupType: 7
        },
      },
      {
        path: FormSubmissionPath.METER_DOCUMENTATION,
        loadComponent: () =>
          import('./f2-form/sub-tasks/meter-details/components/meter-documentation/meter-documentation.component').then(mod => mod.MeterDocumentationComponent),
        canActivate: [],
        data: {
          sectionId: SubmissionGroupType.AddMeterDetails, // groupType: 7
        },
      },
      {
        path: FormSubmissionPath.METER_REVIEW_ANSWERS,
        loadComponent: () => import('./f2-form/sub-tasks/meter-details/components/summary/summary.component').then(mod => mod.SummaryComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.AddMeterDetails, // groupType: 7
        },
      },
      {
        path: FormSubmissionPath.METER_CONRFIRM_DELETION,
        loadComponent: () =>
          import('./f2-form/sub-tasks/meter-details/components/confim-delete-meters/confim-delete-meters.component').then(mod => mod.ConfimDeleteMetersComponent),
        canActivate: [],
        data: {
          sectionId: SubmissionGroupType.AddMeterDetails, // groupType: 7
        },
      },
      {
        path: FormSubmissionPath.PROVIDE_HOURS_OF_OPERATION,
        loadComponent: () =>
          import('./f4-form/sub-tasks/hours-of-operation/pages/provide-hours-of-operation/provide-hours-of-operation.component').then(
            mod => mod.ProvideHoursOfOperationComponent
          ),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.ProvideHoursOfOperation, // groupType: 21
        },
      },
      {
        path: FormSubmissionPath.PROVIDE_HOURS_OF_OPERATION_SUMMARY,
        loadComponent: () => import('./f4-form/sub-tasks/hours-of-operation/pages/summary/summary.component').then(mod => mod.SummaryComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.ProvideHoursOfOperation, // groupType: 21
        },
      },
      {
        path: FormSubmissionPath.PROVIDE_ENERGY_INPUTS,
        loadComponent: () =>
          import('./f4-form/sub-tasks/energy-inputs/provide-energy-inputs/provide-energy-inputs.component').then(mod => mod.ProvideEnergyInputsComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.ProvideEnergyInputs, // groupType: 22
        },
      },
      {
        path: FormSubmissionPath.ENTER_ENERGY_INPUTS,
        loadComponent: () =>
          import('./f4-form/sub-tasks/energy-inputs/enter-energy-input/enter-energy-input.component').then(mod => mod.EnterEnergyInputComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.ProvideEnergyInputs, // groupType: 22
        },
      },
      {
        path: FormSubmissionPath.PROVIDE_POWER_OUTPUTS,
        loadComponent: () =>
          import('./f4-form/sub-tasks/power-outputs/provide-power-outputs/provide-power-outputs.component').then(mod => mod.ProvidePowerOutputsComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.ProvidePowerOutputs, // groupType: 23
        },
      },
      {
        path: FormSubmissionPath.ENTER_POWER_OUTPUT,
        loadComponent: () =>
          import('./f4-form/sub-tasks/power-outputs/enter-power-output/enter-power-output.component').then(mod => mod.EnterPowerOutputComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.ProvidePowerOutputs, // groupType: 23
        },
      },
      {
        path: FormSubmissionPath.HEAT_REJECTION_FACILITY,
        loadComponent: () =>
          import('./f2-form/sub-tasks/heat-rejection-facility/pages/heat-rejection-facility/heat-rejection-facility.component').then(
            mod => mod.HeatRejectionFacilityComponent
          ),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.AddHeatRejectionFacilityDetails, // groupType: 8
        },
      },
      {
        path: FormSubmissionPath.HEAT_REJECTION_FACILITY_SUMMARY,
        loadComponent: () =>
          import('./f2-form/sub-tasks/heat-rejection-facility/pages/heat-rejection-facility-review/heat-rejection-facility-review.component').then(
            mod => mod.HeatRejectionFacilityReviewComponent
          ),
      },
      {
        path: FormSubmissionPath.PROVIDE_HEAT_OUTPUTS,
        loadComponent: () =>
          import('./f4-form/sub-tasks/heat-monitoring-data/provide-heat-outputs/provide-heat-outputs.component').then(mod => mod.ProvideHeatOutputsComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.ProvideHeatOutputs, // groupType: 24
        },
      },
      {
        path: FormSubmissionPath.ENTER_HEAT_OUTPUT + '/:id',
        loadComponent: () =>
          import('./f4-form/sub-tasks/heat-monitoring-data/enter-heat-output/enter-heat-output.component').then(mod => mod.EnterHeatOutputComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.ProvideHeatOutputs, // groupType: 24
        },
      },
      {
        path: FormSubmissionPath.CONDESING_STEAM_TURBINE,
        loadComponent: () =>
          import('./f4-form/sub-tasks/condensing-steam-turbine/condensing-steam-turbine-details/condensing-steam-turbine-details.component').then(
            mod => mod.CondensingSteamTurbineDetailsComponent
          ),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.ProvideCondensingStreamTurbineDetails, // groupType: 26
        },
      },
      {
        path: FormSubmissionPath.CONDESING_STEAM_TURBINE_SUMMARY,
        loadComponent: () =>
          import('./f4-form/sub-tasks/condensing-steam-turbine/summary/summary.component').then(mod => mod.CondensingSteamTurbineSummaryComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.ProvideCondensingStreamTurbineDetails, // groupType: 26
        },
      },
      {
        path: FormSubmissionPath.POWER_EFFICIENCY_THRESHOLD,
        loadComponent: () =>
          import('./f4-form/sub-tasks/power-efficiency-threshold/power-efficiency-threshold.component').then(mod => mod.PowerEfficiencyThresholdComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.PowerEfficiencyStatus, // groupType: 42
        },
      },
      {
        path: FormSubmissionPath.QUALITY_INDEX_STATUS,
        loadComponent: () =>
          import('./f4-form/sub-tasks/quality-index-status/components/show-quality-index-status/show-quality-index-status.component').then(
            mod => mod.QualityIndexStatusComponent
          ),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.QualityIndexStatus, // groupType: 43
        },
      },
      {
        path: FormSubmissionPath.ROC_QUALITY_INDEX_STATUS,
        loadComponent: () =>
          import('./f4-form/sub-tasks/roc-quality-index-status/roc-quality-index-status.component').then(mod => mod.RocQualityIndexStatusComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.RocQualityIndexStatus, // groupType: 44
        },
      },
      {
        path: FormSubmissionPath.CFD_QUALITY_INDEX_STATUS,
        loadComponent: () =>
          import('./f4-form/sub-tasks/cfd-quality-index-status/cfd-quality-index-status.component').then(mod => mod.CfdQualityIndexStatusComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.CfdQualityIndexStatus, // groupType: 45
        },
      },
      {
        path: FormSubmissionPath.REQUEST_SECRETARY_OF_STATE_EXEMPTION_CERTIFICATE,
        loadComponent: () =>
          import('./f4-form/sub-tasks/sos-certificate/request-sos-certificate/request-sos-certificate.component').then(
            mod => mod.RequestSoSCertificateComponent
          ),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.SecretaryOfStateExemptionCertificate, // groupType: 31
        },
      },
      {
        path: FormSubmissionPath.SECRETARY_OF_STATE_EXEMPTION_CERTIFICATE_SUMMARY,
        loadComponent: () => import('./f4-form/sub-tasks/sos-certificate/summary/summary.component').then(mod => mod.SoSCertificateSummaryComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.SecretaryOfStateExemptionCertificate, // groupType: 31
        },
      },
      {
        path: FormSubmissionPath.REQUEST_ROC_CERTIFICATE,
        loadComponent: () =>
          import('./f4-form/sub-tasks/roc-certificate/request-roc-certificate/request-roc-certificate.component').then(
            mod => mod.RequestRocCertificateComponent
          ),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.RenewablesObligationCertificate, // groupType: 33
        },
      },
      {
        path: FormSubmissionPath.ROC_CERTIFICATE_SUMMARY,
        loadComponent: () => import('./f4-form/sub-tasks/roc-certificate/summary/summary.component').then(mod => mod.RocCertificateSummaryComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.RenewablesObligationCertificate, // groupType: 33
        },
      },
      {
        path: FormSubmissionPath.REQUEST_CFD_CERTIFICATE,
        loadComponent: () =>
          import('./f4-form/sub-tasks/cfd-certificate/request-cfd-certificate/request-cfd-certificate.component').then(
            mod => mod.RequestCfdCertificateComponent
          ),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.ContractsForDifferenceCertificate, // groupType: 34
        },
      },
      {
        path: FormSubmissionPath.CFD_CERTIFICATE_SUMMARY,
        loadComponent: () => import('./f4-form/sub-tasks/cfd-certificate/summary/summary.component').then(mod => mod.CfdCertificateSummaryComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.ContractsForDifferenceCertificate, // groupType: 34
        },
      },
      {
        path: FormSubmissionPath.FINANCIAL_BENEFITS,
        loadComponent: () =>
          import('./f4-form/sub-tasks/financial-benefits/pages/financial-benefits/financial-benefits.component').then(mod => mod.FinancialBenefitsComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.ProvideInformationFinancialBenefits, // groupType: 35
        },
      },
      {
        path: FormSubmissionPath.FINANCIAL_BENEFITS_SUMMARY,
        loadComponent: () => import('./f4-form/sub-tasks/financial-benefits/pages/summary/summary.component').then(mod => mod.FinancialBenefitsSummaryComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.ProvideInformationFinancialBenefits, // groupType: 35
        },
      },
      {
        path: FormSubmissionPath.QUALITY_INDEX_THRESHOLD,
        loadComponent: () =>
          import('./f4-form/sub-tasks/quality-index-threshold/quality-index-threshold/quality-index-threshold.component').then(
            mod => mod.QualityIndexThresholdComponent
          ),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.QualityIndexThreshold, // groupType: 41
        },
      },
      {
        path: FormSubmissionPath.QUALITY_INDEX_THRESHOLD_SUMMARY,
        loadComponent: () =>
          import('./f4-form/sub-tasks/quality-index-threshold/summary/summary.component').then(mod => mod.QualityIndexThresholdSummaryComponent),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.QualityIndexThreshold, // groupType: 41
        },
      },
      {
        path: FormSubmissionPath.UPLOAD_PERFORMANCE_DATA,
        loadComponent: () =>
          import('./f4-form/sub-tasks/bulk-performance-data/pages/upload-performance-data/upload-performance-data.component').then(
            mod => mod.UploadPerformanceDataComponent
          ),
        // TODO provide enum for Upload Perofrmance Data
        // canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        // data: {
        //   sectionId: SubmissionGroupType.Perform, // groupType: 25
        // },
      },
      {
        path: FormSubmissionPath.UPLOAD_PERFORMANCE_DATA_SUMMARY,
        loadComponent: () =>
          import('./f4-form/sub-tasks/bulk-performance-data/pages/summary/summary.component').then(mod => mod.UploadPerformanceDataSummaryComponent),
        // TODO provide enum for Upload Perofrmance Data
        // canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        // data: {
        //   sectionId: SubmissionGroupType.ProvideUncertaintyFactors, // groupType: 25
        // },
      },
      {
        path: FormSubmissionPath.UPLOAD_PERFORMANCE_DATA_SUBMIT_PROGRESS,
        loadComponent: () =>
          import('./f4-form/sub-tasks/bulk-performance-data/pages/submit-progress/submit-progress.component').then(
            mod => mod.UploadPerformanceDataSubmitComponent
          ),
        // TODO provide enum for Upload Perofrmance Data
        // canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        // data: {
        //   sectionId: SubmissionGroupType.ProvideUncertaintyFactors, // groupType: 25
        // },
      },
      {
        path: FormSubmissionPath.PROVIDE_UNCERTAINTY_FACTORS,
        loadComponent: () =>
          import('./f4-form/sub-tasks/uncertainty-factors/pages/adjustment-factors-inputs/adjustment-factors-inputs.component').then(
            mod => mod.AdjustmentFactorsInputsComponent
          ),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.ProvideUncertaintyFactors, // groupType: 25
        },
      },
      {
        path: FormSubmissionPath.PROVIDE_UNCERTAINTY_FACTORS_UPLOAD,
        loadComponent: () =>
          import('./f4-form/sub-tasks/uncertainty-factors/pages/adjustment-factors-upload/adjustment-factors-upload.component').then(
            mod => mod.AdjustmentFactorsUploadComponent
          ),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.ProvideUncertaintyFactors, // groupType: 25
        },
      },
      {
        path: FormSubmissionPath.PROVIDE_UNCERTAINTY_FACTORS_SUMMARY,
        loadComponent: () =>
          import('./f4-form/sub-tasks/uncertainty-factors/pages/adjustment-factors-review/adjustment-factors-review.component').then(
            mod => mod.AdjustmentFactorsReviewComponent
          ),
        canActivate: [CanNavigateToSubmissionReviewScreenGuard],
        data: {
          sectionId: SubmissionGroupType.ProvideUncertaintyFactors, // groupType: 25
        },
      },
      {
        path: FormSubmissionPath.SUBMIT_FORM,
        loadComponent: () =>
          import(
            './f4-form/sub-tasks/submit/pages/submit-form/submit-form.component'
          ).then(mod => mod.SubmitFormComponent),
      },
      {
        path: FormSubmissionPath.SUBMIT_SUCCESS,
        loadComponent: () =>
          import(
            './f4-form/sub-tasks/submit/pages/submit-success/submit-success.component'
          ).then(mod => mod.SubmitSuccessComponent),
      },
    ],
  },
];
