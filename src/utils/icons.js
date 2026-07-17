

export const backArrow = <svg width="24px" height="24px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17 9H5.414l3.293-3.293a.999.999 0 10-1.414-1.414l-5 5a.999.999 0 000 1.414l5 5a.997.997 0 001.414 0 .999.999 0 000-1.414L5.414 11H17a1 1 0 100-2z" fill="#000" /></svg>;

export const loadingIcon = <svg xmlns="http://www.w3.org/2000/svg" width="120px" height="120px" id="L9" x="0px" y="0px"
	viewBox="0 0 100 100" enableBackground="new 0 0 0 0">
	<path fill="#000" d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
		<animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="360 50 50"
			repeatCount="indefinite" />
	</path>
</svg>;

export const googleIcon = <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 16 16" fill="none"><path fill="#4285F4" d="M14.9 8.161c0-.476-.039-.954-.121-1.422h-6.64v2.695h3.802a3.24 3.24 0 01-1.407 2.127v1.75h2.269c1.332-1.22 2.097-3.02 2.097-5.15z" /><path fill="#34A853" d="M8.14 15c1.898 0 3.499-.62 4.665-1.69l-2.268-1.749c-.631.427-1.446.669-2.395.669-1.836 0-3.393-1.232-3.952-2.888H1.85v1.803A7.044 7.044 0 008.14 15z" /><path fill="#FBBC04" d="M4.187 9.342a4.17 4.17 0 010-2.68V4.859H1.849a6.97 6.97 0 000 6.286l2.338-1.803z" /><path fill="#EA4335" d="M8.14 3.77a3.837 3.837 0 012.7 1.05l2.01-1.999a6.786 6.786 0 00-4.71-1.82 7.042 7.042 0 00-6.29 3.858L4.186 6.66c.556-1.658 2.116-2.89 3.952-2.89z" /></svg>;

export const blockIcon = <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" role="img"><path d="M12.678 16.672c0 2.175.002 4.565-.001 6.494-.001.576-.244.814-.817.833-7.045.078-8.927-7.871-4.468-11.334-1.95.016-4.019.007-5.986.007-1.351 0-1.414-.01-1.405-1.351.258-6.583 7.946-8.275 11.323-3.936L11.308.928c-.001-.695.212-.906.906-.925 6.409-.187 9.16 7.308 4.426 11.326l6.131.002c1.097 0 1.241.105 1.228 1.217-.223 6.723-7.802 8.376-11.321 4.124zm.002-15.284-.003 9.972c6.56-.465 6.598-9.532.003-9.972zm-1.36 21.224-.001-9.97c-6.927.598-6.29 9.726.002 9.97zM1.4 11.315l9.95.008c-.527-6.829-9.762-6.367-9.95-.008zm11.238 1.365c.682 6.875 9.67 6.284 9.977.01z" /></svg>;

export const verticalLineIcon = <svg xmlns='http://www.w3.org/2000/svg' width={24} height={24} viewBox='0 0 14.707 14.707'>
	<rect x='6.275' y='0' width='2.158' height='14.707' />
</svg>;

export const horizontalLineIcon = <svg xmlns='http://www.w3.org/2000/svg' width={24} height={24} viewBox='0 0 357 357'>
	<path d='M357,204H0v-51h357V204z' />
</svg>;

// Microphone icon used by the Voice Search button in the search bar.
export const micIcon = (
	<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
		<path d="M19 10v1a7 7 0 0 1-14 0v-1" />
		<line x1="12" y1="18" x2="12" y2="22" />
		<line x1="8" y1="22" x2="16" y2="22" />
	</svg>
);

export const searchIcons = {
	'search-1': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
		</svg>
	),
	'search-2': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
		</svg>
	),
	'search-3': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="11" cy="11" r="7" />
			<line x1="21" y1="21" x2="16" y2="16" />
		</svg>
	),
	'search-4': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="13" cy="11" r="7" />
			<line x1="8" y1="16" x2="3" y2="21" />
		</svg>
	),
	'search-5': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M15 15l5 5" />
			<path d="M16 10a6 6 0 11-12 0 6 6 0 0112 0z" />
		</svg>
	),
	'search-6': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="10" cy="10" r="7" />
			<line x1="21" y1="21" x2="15" y2="15" />
		</svg>
	),
	'search-7': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="11" cy="11" r="6" />
			<line x1="16" y1="16" x2="22" y2="22" />
			<circle cx="11" cy="11" r="2" fill="currentColor" />
		</svg>
	),
	'search-8': (
		<span style={{ fontSize: '18px', display: 'inline-block', lineHeight: '1' }}>🔍</span>
	),
	'search-9': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
			<line x1="8" y1="11" x2="14" y2="11" />
		</svg>
	),
	'search-10': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<ellipse cx="12" cy="5" rx="9" ry="3" />
			<path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
			<path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
		</svg>
	),
	'search-11': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
			<circle cx="8.5" cy="8.5" r="1.5" />
			<polyline points="21 15 16 10 5 21" />
		</svg>
	),
	'search-12': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="10" />
			<line x1="2" y1="12" x2="22" y2="12" />
			<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
		</svg>
	),
	'search-13': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
			<circle cx="12" cy="13" r="3" />
			<line x1="16" y1="17" x2="14" y2="15" />
		</svg>
	),
	'search-14': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<polygon points="3 11 22 2 13 21 11 13 3 11" />
		</svg>
	),
	'search-15': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="10" />
			<circle cx="12" cy="12" r="6" />
			<circle cx="12" cy="12" r="2" />
		</svg>
	),
	'search-16': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
			<line x1="11" y1="8" x2="11" y2="14" />
			<line x1="8" y1="11" x2="14" y2="11" />
		</svg>
	),
	'search-17': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
			<line x1="8" y1="11" x2="14" y2="11" />
		</svg>
	),
	'search-18': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
		</svg>
	),
	'search-19': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="11" cy="11" r="6" />
			<line x1="11" y1="5" x2="11" y2="2" />
			<line x1="21" y1="21" x2="15.5" y2="15.5" />
		</svg>
	),
	'search-20': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
			<path d="M8 9a4 4 0 0 1 5-1" />
		</svg>
	),
	'search-21': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="10" cy="10" r="6" />
			<path d="M14.5 14.5L19 19c.8.8.8 2 0 2.8s-2 .8-2.8 0l-4.5-4.5" />
		</svg>
	),
	'search-22': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="9" cy="9" r="6" />
			<line x1="20" y1="20" x2="13.5" y2="13.5" />
			<line x1="17" y1="6" x2="21" y2="6" />
			<line x1="17" y1="10" x2="21" y2="10" />
		</svg>
	),
	'search-23': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
			<circle cx="11" cy="11" r="1.5" fill="currentColor" />
		</svg>
	),
	'search-24': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
			<line x1="7" y1="7" x2="7.01" y2="7" />
		</svg>
	),
	'search-25': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	),
	'search-26': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="9" cy="9" r="6" />
			<line x1="21" y1="21" x2="13.5" y2="13.5" />
			<circle cx="14" cy="14" r="5" />
		</svg>
	),
	'search-27': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M3 7V5a2 2 0 0 1 2-2h2" />
			<path d="M17 3h2a2 2 0 0 1 2 2v2" />
			<path d="M21 17v2a2 2 0 0 1-2 2h-2" />
			<path d="M7 21H5a2 2 0 0 1-2-2v-2" />
			<circle cx="12" cy="12" r="3" />
			<line x1="12" y1="7" x2="12" y2="17" />
		</svg>
	),
	'search-28': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
			<path d="M7 11V7a5 5 0 0 1 10 0v4" />
		</svg>
	),
	'search-29': (
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
		</svg>
	),
	'search-30': (
		<span style={{ fontSize: '18px', display: 'inline-block', lineHeight: '1' }}>🔎</span>
	)
};