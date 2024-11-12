import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  BulkImportf4cService,
  BulkImportf4sService,
  CreateManufactModelEngineUnitService,
  CreateOutputUnitService,
  CreateSchemeService,
  CreateSubmissionService,
  GetAdditEquipListBySubmissionIdService,
  GetCompanyInformationService,
  GetContactByEmailService,
  GetDelegatedByOrgService,
  GetEconSectAndSubSectService,
  GetEnergyInputListBySubmIdService,
  GetEquipmentListBySubmissionIdService,
  GetEquipmentTypesAndSubTypesService,
  GetFuelCategoriesAndFuelsService,
  GetHeatOutputListBySubmIdService,
  GetListValuesService,
  GetMeterListBySubmissionIdService,
  GetOrganisationByNameService,
  GetOutputUnitsService,
  GetPoliciesService,
  GetPowerOutputListBySubmIdService,
  GetSchemeByIdService,
  GetSchemesByUserIdService,
  GetSubmissionBySchemeidService,
  GetSubmissionByidService,
  GetUnitsService,
  RegisterUserService,
  SendRegistrationEmailService,
  UpdSubmEnergyInputListService,
  UpdSubmFinancialBenefitsService,
  UpdSubmHeatOutputListService,
  UpdSubmQIThresholdService,
  UpdSubmHeatRejFacService,
  UpdSubmPowerOutputListService,
  UpdSubmSoSCertifService,
  UpdSubmTotalPowCapMaxHeatCondService,
  UpdSubmtoAssessorService,
  UpdateSubmissionAdditEquipListService,
  UpdateSubmissionEquipmentListService,
  UpdateSubmissionHoursOfOpService,
  UpdateSubmissionMeterListService,
  UpdateSubmissionReviewSchemeDetailsService,
  UpdateUncertaintyService,
  UploadFilesService,
  ValidateImportf4cService,
  ValidateImportf4sService,
  VerifyTokenService,
  CheckIfUserExistsService,
  DownloadFilesForSubmissionService,
  GetSICCodeDetailsListService,
  UpdSubmZRatioService,
  UpdSubmROCSCertifService,
  UpdSubmCFDCertifService,
  DownloadEquipMeterFileService,
  CreateAssessorsAssessmentService,
  GetAddressInformationService,
  DeleteFileService,
  UpdSubmDiagramCommentService,
  GetSubmissionFilesListService,
  DeleteMeterService,
  DeleteEquipmentService,
  GetSchemesforAssessorService,
  GetAssessorsAssessmentService,
  GetSiteLocationByAddressService,
  DownloadFileForSubmissionService,
  GetAuditRecService,
  UpdAuditRecService,
  GetAssessCommentsTA1Service,
  GetSecondAssessorsService,
  AssignSecondAssessorOrRpService,
  GetAssessmentDecisionService,
  UpdateAssessmentDecisionService,
  UpdSubmReviewTA1CommentsService,
  AssignSchemeForAssessmentService,
  UpdSubmDueDateConfService,
  GetSubmDueDateService,
  GetAssessorsAdminCommentService,
  PostAdminAssessorCommentService,
  GetSchemeHistoryService
} from '../generated';

@Injectable({
  providedIn: 'root',
})
export class ChqpaApiServiceWrapper {
  private baseUrl: string = environment.baseUrl;
  constructor(
    public bulkImportf4sService: BulkImportf4sService,
    public bulkImportf4cService: BulkImportf4cService,
    public createAssessorsAssessmentService: CreateAssessorsAssessmentService,
    public createManufactModelEngineUnitService: CreateManufactModelEngineUnitService,
    public createOutputUnitService: CreateOutputUnitService,
    public createSchemeService: CreateSchemeService,
    public createSubmissionService: CreateSubmissionService,
    public getAdditEquipListBySubmissionIdService: GetAdditEquipListBySubmissionIdService,
    public getAddressInformationService: GetAddressInformationService,
    public getAssessorsAssessmentService: GetAssessorsAssessmentService,
    public getCompanyInformationService: GetCompanyInformationService,
    public getContactByEmailService: GetContactByEmailService,
    public getDelegatedByOrgService: GetDelegatedByOrgService,
    public getEconSectAndSubSectService: GetEconSectAndSubSectService,
    public getEnergyInputListBySubmIdService: GetEnergyInputListBySubmIdService,
    public getEquipmentListBySubmissionIdService: GetEquipmentListBySubmissionIdService,
    public getEquipmentTypesAndSubTypesService: GetEquipmentTypesAndSubTypesService,
    public getFuelCategoriesAndFuelsService: GetFuelCategoriesAndFuelsService,
    public getHeatOutputListBySubmIdService: GetHeatOutputListBySubmIdService,
    public getListValuesService: GetListValuesService,
    public getMeterListBySubmissionIdService: GetMeterListBySubmissionIdService,
    public getOrganisationByNameService: GetOrganisationByNameService,
    public getOutputUnitsService: GetOutputUnitsService,
    public getPoliciesService: GetPoliciesService,
    public getPowerOutputListBySubmIdService: GetPowerOutputListBySubmIdService,
    public getSICCodeDetailsListService: GetSICCodeDetailsListService,
    public getSchemeByIdService: GetSchemeByIdService,
    public getSchemesByUserIdService: GetSchemesByUserIdService,
    public getSubmissionBySchemeidService: GetSubmissionBySchemeidService,
    public getSubmissionByidService: GetSubmissionByidService,
    public getUnitsService: GetUnitsService,
    public registerUserService: RegisterUserService,
    public sendRegistrationEmailService: SendRegistrationEmailService,
    public updSubmEnergyInputListService: UpdSubmEnergyInputListService,
    public updSubmFinancialBenefitsService: UpdSubmFinancialBenefitsService,
    public updSubmHeatOutputListService: UpdSubmHeatOutputListService,
    public updSubmHeatRejFacService: UpdSubmHeatRejFacService,
    public updSubmPowerOutputListService: UpdSubmPowerOutputListService,
    public updSubmQIThresholdService: UpdSubmQIThresholdService,
    public updSubmSoSCertifService: UpdSubmSoSCertifService,
    public updSubmRocsCertifService: UpdSubmROCSCertifService,
    public updSubmCFDCertifService: UpdSubmCFDCertifService,
    public updSubmTotalPowCapMaxHeatCondService: UpdSubmTotalPowCapMaxHeatCondService,
    public updSubmtoAssessorService: UpdSubmtoAssessorService,
    public updateSubmissionAdditEquipListService: UpdateSubmissionAdditEquipListService,
    public updateSubmissionEquipmentListService: UpdateSubmissionEquipmentListService,
    public updateSubmissionHoursOfOpService: UpdateSubmissionHoursOfOpService,
    public updateSubmissionMeterListService: UpdateSubmissionMeterListService,
    public updateSubmissionReviewSchemeDetailsService: UpdateSubmissionReviewSchemeDetailsService,
    public uploadFilesService: UploadFilesService,
    public validateImportf4sService: ValidateImportf4sService,
    public validateImportf4cService: ValidateImportf4cService,
    public verifyTokenService: VerifyTokenService,
    public checkIfUserExistsService: CheckIfUserExistsService,
    public updateUncertaintyService: UpdateUncertaintyService,
    public downloadFilesForSubmissionService: DownloadFilesForSubmissionService, //TODO remove this
    public updSubmZRatioService: UpdSubmZRatioService,
    public downloadEquipMeterFileService: DownloadEquipMeterFileService,
    public deleteFileService: DeleteFileService,
    public updSubmDiagramCommentService: UpdSubmDiagramCommentService,
    public getSubmissionFilesListService: GetSubmissionFilesListService,
    public getSchemesByTAssessorService: GetSchemesforAssessorService,
    public deleteEquipmentService: DeleteEquipmentService,
    public deleteMetertService: DeleteMeterService,
    public getSiteLocationByAddressService: GetSiteLocationByAddressService,
    public downloadFileForSubmissionService: DownloadFileForSubmissionService,
    public getAuditRecService: GetAuditRecService,
    public postAuditRecService: UpdAuditRecService,
    public getAssessCommentsTA1Service: GetAssessCommentsTA1Service,
    public getSecondAssessorsService: GetSecondAssessorsService,
    public assignSecondAssessorOrRpService: AssignSecondAssessorOrRpService,
    public getAssessmentDecision: GetAssessmentDecisionService,
    public postAssessmentDecision: UpdateAssessmentDecisionService,
    public updSubmReviewTA1CommentsService: UpdSubmReviewTA1CommentsService,
    public assignSchemeForAssessmentService: AssignSchemeForAssessmentService,
    public updSubmDueDateConfService: UpdSubmDueDateConfService,
    public getSubmDueDateService: GetSubmDueDateService,
    public getAssessorsAdminCommentService: GetAssessorsAdminCommentService,
    public postAdminAssessorCommentService: PostAdminAssessorCommentService,
    public schemeHistoryService: GetSchemeHistoryService
  ) {
    this.setServicesBaseUrl();
  }

  private setServicesBaseUrl(): void {
    this.bulkImportf4sService.configuration.basePath = this.baseUrl;
    this.bulkImportf4cService.configuration.basePath = this.baseUrl;
    this.createAssessorsAssessmentService.configuration.basePath = this.baseUrl;
    this.createManufactModelEngineUnitService.configuration.basePath = this.baseUrl;
    this.createOutputUnitService.configuration.basePath = this.baseUrl;
    this.createSchemeService.configuration.basePath = this.baseUrl;
    this.createSubmissionService.configuration.basePath = this.baseUrl;
    this.getAdditEquipListBySubmissionIdService.configuration.basePath = this.baseUrl;
    this.getAdditEquipListBySubmissionIdService.configuration.basePath = this.baseUrl;
    this.getAddressInformationService.configuration.basePath = this.baseUrl;
    this.getAssessorsAssessmentService.configuration.basePath = this.baseUrl;
    this.getCompanyInformationService.configuration.basePath = this.baseUrl;
    this.getContactByEmailService.configuration.basePath = this.baseUrl;
    this.getDelegatedByOrgService.configuration.basePath = this.baseUrl;
    this.getEconSectAndSubSectService.configuration.basePath = this.baseUrl;
    this.getEnergyInputListBySubmIdService.configuration.basePath = this.baseUrl;
    this.getEquipmentListBySubmissionIdService.configuration.basePath = this.baseUrl;
    this.getEquipmentTypesAndSubTypesService.configuration.basePath = this.baseUrl;
    this.getFuelCategoriesAndFuelsService.configuration.basePath = this.baseUrl;
    this.getHeatOutputListBySubmIdService.configuration.basePath = this.baseUrl;
    this.getListValuesService.configuration.basePath = this.baseUrl;
    this.getMeterListBySubmissionIdService.configuration.basePath = this.baseUrl;
    this.getOrganisationByNameService.configuration.basePath = this.baseUrl;
    this.getOutputUnitsService.configuration.basePath = this.baseUrl;
    this.getPoliciesService.configuration.basePath = this.baseUrl;
    this.getPowerOutputListBySubmIdService.configuration.basePath = this.baseUrl;
    this.getSICCodeDetailsListService.configuration.basePath = this.baseUrl;
    this.getSchemeByIdService.configuration.basePath = this.baseUrl;
    this.getSchemesByUserIdService.configuration.basePath = this.baseUrl;
    this.getSubmissionBySchemeidService.configuration.basePath = this.baseUrl;
    this.getSubmissionByidService.configuration.basePath = this.baseUrl;
    this.getUnitsService.configuration.basePath = this.baseUrl;
    this.registerUserService.configuration.basePath = this.baseUrl;
    this.sendRegistrationEmailService.configuration.basePath = this.baseUrl;
    this.updSubmEnergyInputListService.configuration.basePath = this.baseUrl;
    this.updSubmFinancialBenefitsService.configuration.basePath = this.baseUrl;
    this.updSubmHeatOutputListService.configuration.basePath = this.baseUrl;
    this.updSubmHeatRejFacService.configuration.basePath = this.baseUrl;
    this.updSubmPowerOutputListService.configuration.basePath = this.baseUrl;
    this.updSubmQIThresholdService.configuration.basePath = this.baseUrl;
    this.updSubmSoSCertifService.configuration.basePath = this.baseUrl;
    this.updSubmRocsCertifService.configuration.basePath = this.baseUrl;
    this.updSubmCFDCertifService.configuration.basePath = this.baseUrl;
    this.updSubmTotalPowCapMaxHeatCondService.configuration.basePath = this.baseUrl;
    this.updSubmtoAssessorService.configuration.basePath = this.baseUrl;
    this.updateSubmissionAdditEquipListService.configuration.basePath = this.baseUrl;
    this.updateSubmissionEquipmentListService.configuration.basePath = this.baseUrl;
    this.updateSubmissionHoursOfOpService.configuration.basePath = this.baseUrl;
    this.updateSubmissionMeterListService.configuration.basePath = this.baseUrl;
    this.updateSubmissionReviewSchemeDetailsService.configuration.basePath = this.baseUrl;
    this.uploadFilesService.configuration.basePath = this.baseUrl;
    this.validateImportf4sService.configuration.basePath = this.baseUrl;
    this.validateImportf4cService.configuration.basePath = this.baseUrl;
    this.verifyTokenService.configuration.basePath = this.baseUrl;
    this.checkIfUserExistsService.configuration.basePath = this.baseUrl;
    this.updateUncertaintyService.configuration.basePath = this.baseUrl;
    this.downloadFilesForSubmissionService.configuration.basePath = this.baseUrl;
    this.updSubmZRatioService.configuration.basePath = this.baseUrl;
    this.downloadEquipMeterFileService.configuration.basePath = this.baseUrl;
    this.deleteFileService.configuration.basePath = this.baseUrl;
    this.updSubmDiagramCommentService.configuration.basePath = this.baseUrl;
    this.getSubmissionFilesListService.configuration.basePath = this.baseUrl;
    this.getSchemesByTAssessorService.configuration.basePath = this.baseUrl;
    this.deleteEquipmentService.configuration.basePath = this.baseUrl;
    this.deleteMetertService.configuration.basePath = this.baseUrl;
    this.getSiteLocationByAddressService.configuration.basePath = this.baseUrl;
    this.downloadFileForSubmissionService.configuration.basePath = this.baseUrl;
    this.getAssessCommentsTA1Service.configuration.basePath = this.baseUrl;
    this.assignSecondAssessorOrRpService.configuration.basePath = this.baseUrl;
    this.getAuditRecService.configuration.basePath = this.baseUrl;
    this.postAuditRecService.configuration.basePath = this.baseUrl;
    this.getAssessmentDecision.configuration.basePath = this.baseUrl;
    this.postAssessmentDecision.configuration.basePath = this.baseUrl;
    this.getAssessCommentsTA1Service.configuration.basePath = this.baseUrl;
    this.getSecondAssessorsService.configuration.basePath = this.baseUrl;
    this.assignSecondAssessorOrRpService.configuration.basePath = this.baseUrl;
    this.updSubmReviewTA1CommentsService.configuration.basePath = this.baseUrl;
    this.assignSchemeForAssessmentService.configuration.basePath = this.baseUrl;
    this.updSubmDueDateConfService.configuration.basePath = this.baseUrl;
    this.getSubmDueDateService.configuration.basePath = this.baseUrl;
    this.getAssessorsAdminCommentService.configuration.basePath = this.baseUrl;
    this.postAdminAssessorCommentService.configuration.basePath = this.baseUrl;
    this.schemeHistoryService.configuration.basePath = this.baseUrl;
  }
}
