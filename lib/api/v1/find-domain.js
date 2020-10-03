const config = require('../../config');

module.exports = function findDomainIfExists(domain) {
	domain = new URL(domain.toLowerCase());
	const domains = config.get('domains');

	return domains.find(domainWildCard => {
		if (domainWildCard.startsWith('*.')) {
			domainWildCard = domainWildCard.replace('*.', '');
			// This makes the URL Valid so the URL parser can validate
			domainWildCard = `https://${domainWildCard}/`;
			const {host} = new URL(domainWildCard);
			// CASE: wildcard has port (*.my.domain:300)
			// CASE: wildcard does not have port (*.my.domain)
			return domain.host.endsWith(host) || domain.hostname.endsWith(host);
		}

		const {host} = new URL(`https://${domainWildCard}`);
		// Same cases as above, just using a stricter set of rules
		return (host === domain.host || host === domain.hostname);
	});
};
