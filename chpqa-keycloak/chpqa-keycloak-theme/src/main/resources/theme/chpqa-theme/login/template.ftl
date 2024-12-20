<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayWide=false displayRequiredFields=false htmlPageTitle="${msg('loginTitle')}">
<!DOCTYPE html>
<html lang="en" class="govuk-template ">

<head>
	<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
	new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
	j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
	'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
	})(window,document,'script','dataLayer','GTM-MRDL7T43');</script>
  <meta charset="utf-8" />
  <title>${htmlPageTitle}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#0b0c0c" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  
  <link rel="shortcut icon" sizes="16x16 32x32 48x48" href="${url.resourcesPath}/img/favicon.ico" type="image/x-icon" />
  <link rel="mask-icon" href="${url.resourcesPath}/img/govuk-mask-icon.svg" color="#0b0c0c">
  <link rel="apple-touch-icon" sizes="180x180" href="${url.resourcesPath}/img/govuk-apple-touch-icon-180x180.png">
  <link rel="apple-touch-icon" sizes="167x167" href="${url.resourcesPath}/img/govuk-apple-touch-icon-167x167.png">
  <link rel="apple-touch-icon" sizes="152x152" href="${url.resourcesPath}/img/govuk-apple-touch-icon-152x152.png">
  <link rel="apple-touch-icon" href="${url.resourcesPath}/img/govuk-apple-touch-icon.png">
	
  <meta property="og:image" content="${url.resourcesPath}/img/govuk-opengraph-image.png">

    <#if properties.meta?has_content>
        <#list properties.meta?split(' ') as meta>
            <meta name="${meta?split('==')[0]}" content="${meta?split('==')[1]}"/>
        </#list>
    </#if>
    
    <link rel="icon" href="${url.resourcesPath}/img/favicon.ico" />
    
	<#if properties.styles?has_content>
		<#list properties.styles?split(' ') as style>
			<link href="${url.resourcesPath}/${style}" rel="stylesheet"/>
		</#list>
	</#if>

	<#if properties.scripts?has_content>
		<#list properties.scripts?split(' ') as script>
			<script src="${url.resourcesPath}/${script}"></script>
		</#list>
	</#if>

	<#if scripts??>
		<#list scripts as script>
			<script src="${script}"></script>
		</#list>
	</#if>
</head>

<body class="govuk-template__body ">


	<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MRDL7T43"
	height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

	  <script>
	    document.body.className = ((document.body.className) ? document.body.className + ' js-enabled' : 'js-enabled');
	  </script>

      <header class="govuk-header" data-module="govuk-header">
	    <div class="govuk-header__container govuk-width-container">
	      <div class="govuk-header__logo">
	        <a href="${properties.govukUrl}" class="govuk-header__link govuk-header__link--homepage">
	          <span class="govuk-header__logotype">
	            <svg role="presentation" focusable="false" class="govuk-header__logotype-crown" xmlns="http://www.w3.org/2000/svg" viewbox="0 0 132 97" height="30" width="36">
	              <path fill="currentColor" fill-rule="evenodd" d="M25 30.2c3.5 1.5 7.7-.2 9.1-3.7 1.5-3.6-.2-7.8-3.9-9.2-3.6-1.4-7.6.3-9.1 3.9-1.4 3.5.3 7.5 3.9 9zM9 39.5c3.6 1.5 7.8-.2 9.2-3.7 1.5-3.6-.2-7.8-3.9-9.1-3.6-1.5-7.6.2-9.1 3.8-1.4 3.5.3 7.5 3.8 9zM4.4 57.2c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.5-1.5-7.6.3-9.1 3.8-1.4 3.5.3 7.6 3.9 9.1zm38.3-21.4c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.6-1.5-7.6.3-9.1 3.8-1.3 3.6.4 7.7 3.9 9.1zm64.4-5.6c-3.6 1.5-7.8-.2-9.1-3.7-1.5-3.6.2-7.8 3.8-9.2 3.6-1.4 7.7.3 9.2 3.9 1.3 3.5-.4 7.5-3.9 9zm15.9 9.3c-3.6 1.5-7.7-.2-9.1-3.7-1.5-3.6.2-7.8 3.7-9.1 3.6-1.5 7.7.2 9.2 3.8 1.5 3.5-.3 7.5-3.8 9zm4.7 17.7c-3.6 1.5-7.8-.2-9.2-3.8-1.5-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.3 3.5-.4 7.6-3.9 9.1zM89.3 35.8c-3.6 1.5-7.8-.2-9.2-3.8-1.4-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.4 3.6-.3 7.7-3.9 9.1zM69.7 17.7l8.9 4.7V9.3l-8.9 2.8c-.2-.3-.5-.6-.9-.9L72.4 0H59.6l3.5 11.2c-.3.3-.6.5-.9.9l-8.8-2.8v13.1l8.8-4.7c.3.3.6.7.9.9l-5 15.4v.1c-.2.8-.4 1.6-.4 2.4 0 4.1 3.1 7.5 7 8.1h.2c.3 0 .7.1 1 .1.4 0 .7 0 1-.1h.2c4-.6 7.1-4.1 7.1-8.1 0-.8-.1-1.7-.4-2.4V34l-5.1-15.4c.4-.2.7-.6 1-.9zM66 92.8c16.9 0 32.8 1.1 47.1 3.2 4-16.9 8.9-26.7 14-33.5l-9.6-3.4c1 4.9 1.1 7.2 0 10.2-1.5-1.4-3-4.3-4.2-8.7L108.6 76c2.8-2 5-3.2 7.5-3.3-4.4 9.4-10 11.9-13.6 11.2-4.3-.8-6.3-4.6-5.6-7.9 1-4.7 5.7-5.9 8-.5 4.3-8.7-3-11.4-7.6-8.8 7.1-7.2 7.9-13.5 2.1-21.1-8 6.1-8.1 12.3-4.5 20.8-4.7-5.4-12.1-2.5-9.5 6.2 3.4-5.2 7.9-2 7.2 3.1-.6 4.3-6.4 7.8-13.5 7.2-10.3-.9-10.9-8-11.2-13.8 2.5-.5 7.1 1.8 11 7.3L80.2 60c-4.1 4.4-8 5.3-12.3 5.4 1.4-4.4 8-11.6 8-11.6H55.5s6.4 7.2 7.9 11.6c-4.2-.1-8-1-12.3-5.4l1.4 16.4c3.9-5.5 8.5-7.7 10.9-7.3-.3 5.8-.9 12.8-11.1 13.8-7.2.6-12.9-2.9-13.5-7.2-.7-5 3.8-8.3 7.1-3.1 2.7-8.7-4.6-11.6-9.4-6.2 3.7-8.5 3.6-14.7-4.6-20.8-5.8 7.6-5 13.9 2.2 21.1-4.7-2.6-11.9.1-7.7 8.8 2.3-5.5 7.1-4.2 8.1.5.7 3.3-1.3 7.1-5.7 7.9-3.5.7-9-1.8-13.5-11.2 2.5.1 4.7 1.3 7.5 3.3l-4.7-15.4c-1.2 4.4-2.7 7.2-4.3 8.7-1.1-3-.9-5.3 0-10.2l-9.5 3.4c5 6.9 9.9 16.7 14 33.5 14.8-2.1 30.8-3.2 47.7-3.2z"></path>
	            </svg>
	            <span class="govuk-header__logotype-text">
	              GOV.UK
	            </span>
	          </span>
	        </a>
	      </div>
        <div class="govuk-header__content">
          <a href="/" class="govuk-header__link govuk-header__link--service-name">
              <span>Combined Heat and Power Quality</span><br />
              <span>Assurance programme</span>
          </a>
        </div>
	    </div>
      </header>            
      
	  <div class="govuk-width-container">
		    <main class="govuk-main-wrapper" id="main-content" style="min-height: calc(100vh - 60px - 310px);">
		    
			  <#nested "navigation">
			  
		      <h1 class="govuk-heading-l"><#nested "header"></h1>
		      
		      <#-- App-initiated actions should not see warning messages about the need to complete the action -->
	          <#-- during login.                                                                               -->
			  <#assign hasError = message?has_content && message.summary?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
			  <#assign isSystemAction = message?has_content && message.summary?has_content && message.summary == msg("configureTotpMessage")>
	          <#if hasError && !isSystemAction>	              
					<div class="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabindex="-1" data-module="govuk-error-summary">
					  <h2 class="govuk-error-summary__title" id="error-summary-title">
					    There is a problem
					  </h2>
					  <div class="govuk-error-summary__body">
					    <ul class="govuk-list govuk-error-summary__list">
					      <li>
							<#if message.summary == msg("invalidUserMessage")><a href="#username">${kcSanitize(message.summary)?no_esc}</a>
							<#elseif message.summary == msg("missingTotpMessage") || message.summary == msg("invalidTotpMessage")><a href="#otpCode">${kcSanitize(message.summary)?no_esc}</a>
							<#else><a href="#">${kcSanitize(message.summary)?no_esc}</a>
							</#if>
					      </li>
					    </ul>
					  </div>
					</div>	              	              
	          </#if>
	
	          
	          <#if displayInfo>
	              <div id="kc-info" class="${properties.kcSignUpClass!}">
	                  <div id="kc-info-wrapper" class="${properties.kcInfoAreaWrapperClass!}">
	                      <#nested "info">
	                  </div>
	              </div>
	          </#if>	         

	          <#nested "form">	

	          <#if displayInfo>
	              <div id="kc-problems-sign-in-info" class="${properties.kcSignUpClass!}">
	                  <div id="kc-problems-sign-in-info-wrapper" class="${properties.kcInfoAreaWrapperClass!}">
	                      <#nested "problems">
	                  </div>
	              </div>
	          </#if>
	          
            <#if displayInfo>
                <div id="kc-problems-sign-in" class="${properties.kcSignUpClass!}">
                    <div id="kc-problems-sign-in-wrapper" class="${properties.kcInfoAreaWrapperClass!}">
                        <div id="kc-solutions" class="govuk-body">
                            <h1 class="govuk-heading-s">${msg("problemsSignIn")}</h1>
                            <ul class="govuk-list">
                                <li>
                                    <a id="forgotPasswordLink" class="govuk-link"
                                       href="${properties.loginResetCredentialsUrl}">${msg("doForgotPassword")}</a>
                                    <input type="hidden" id="forgotPasswordPath"
                                           value="${properties.loginResetCredentialsUrl}"/>
                                </li>
                                <li>
                                    <a id="lostAuthAppLink" class="govuk-link"
                                       href="${properties.lost2FADeviceUrl}">${msg("lost2FADevice")}</a>
                                    <input type="hidden" id="lostAuthAppLinkPath"
                                           value="${properties.lost2FADeviceUrl}"/>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </#if>	          

				<div class="govuk-!-margin-bottom-9"></div>			  
		    </main>
		  </div>	  
  
  
    <footer class="govuk-footer">
    <div class="govuk-width-container">
      <div class="govuk-footer__meta">
        <div class="govuk-footer__meta-item govuk-footer__meta-item--grow">
			<ul class="govuk-footer__inline-list">
				<li class="govuk-footer__inline-list-item">
					<a class="govuk-footer__link" href="${properties.privacyNoticeUrl}">${msg("privacyNotice")}</a>
				</li>
				<li class="govuk-footer__inline-list-item">
					<a class="govuk-footer__link" href="${properties.contactUsUrl}">${msg("contactUs")}</a>
				</li>
				<li class="govuk-footer__inline-list-item">
					<a class="govuk-footer__link" href="${properties.accessibilityStatementUrl}">${msg("accessibilityStatement")}</a>
				</li>
			</ul>

          <svg role="presentation" focusable="false" class="govuk-footer__licence-logo" xmlns="http://www.w3.org/2000/svg" viewbox="0 0 483.2 195.7" height="17" width="41">
            <path fill="currentColor" d="M421.5 142.8V.1l-50.7 32.3v161.1h112.4v-50.7zm-122.3-9.6A47.12 47.12 0 0 1 221 97.8c0-26 21.1-47.1 47.1-47.1 16.7 0 31.4 8.7 39.7 21.8l42.7-27.2A97.63 97.63 0 0 0 268.1 0c-36.5 0-68.3 20.1-85.1 49.7A98 98 0 0 0 97.8 0C43.9 0 0 43.9 0 97.8s43.9 97.8 97.8 97.8c36.5 0 68.3-20.1 85.1-49.7a97.76 97.76 0 0 0 149.6 25.4l19.4 22.2h3v-87.8h-80l24.3 27.5zM97.8 145c-26 0-47.1-21.1-47.1-47.1s21.1-47.1 47.1-47.1 47.2 21 47.2 47S123.8 145 97.8 145" />
          </svg>
          <span class="govuk-footer__licence-description">
            All content is available under the
            <a class="govuk-footer__link" href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="license">Open Government Licence v3.0</a>, except where otherwise stated
          </span>
        </div>
        <div class="govuk-footer__meta-item">
          <a class="govuk-footer__link govuk-footer__copyright-logo" href="https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/">© Crown copyright</a>
        </div>
      </div>
    </div>
  </footer>

  <script>
    window.GOVUKFrontend.initAll()
  </script>
  <#if properties.bodyScripts?has_content>
	<#list properties.bodyScripts?split(' ') as bodyScript>
		<script src="${url.resourcesPath}/${bodyScript}"></script>
	</#list>
</#if>
</body>
</html>
</#macro>