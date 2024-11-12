<#list event.details as item>
	<#if item.key == "redirect_uri">
		<#assign url>${item.value}</#assign>
	</#if>
</#list>
<html>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MRDL7T43"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<p>${kcSanitize(msg("eventLoginErrorBodyText", event.date?string["dd/MM/yyyy 'at' HH:mm"]))?no_esc} <a href="${url}">${url}</a>.</p>
<p>${msg("eventLoginErrorBodyContact")}</p>
</body>
</html>