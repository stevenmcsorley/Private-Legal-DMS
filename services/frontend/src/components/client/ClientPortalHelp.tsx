import React from 'react';

interface ClientPortalHelpProps {
  type: 'no-documents' | 'no-matters' | 'access-denied' | 'general';
  message?: string;
}

export const ClientPortalHelp: React.FC<ClientPortalHelpProps> = ({ type, message }) => {
  const getHelpContent = () => {
    switch (type) {
      case 'no-documents':
        return {
          title: 'No Documents Available',
          description: message || 'There are currently no documents available for your review.',
          tips: [
            'Documents may be under review by your legal team',
            'Confidential or privileged documents are not shown here',
            'Check back later or contact your attorney for updates',
          ],
        };
      case 'no-matters':
        return {
          title: 'No Active Matters',
          description: 'You don\'t have any active legal matters at this time.',
          tips: [
            'New matters will appear here when they are created',
            'Contact your attorney if you believe this is incorrect',
          ],
        };
      case 'access-denied':
        return {
          title: 'Access Restricted',
          description: message || 'Your account needs to be set up by an administrator.',
          tips: [
            'Contact your law firm\'s administrator',
            'Ensure your account has been properly configured',
            'You may need to be assigned to a client profile',
          ],
        };
      case 'general':
        return {
          title: 'Client Portal Information',
          description: 'Welcome to your client portal. Here you can view your legal matters and documents.',
          tips: [
            'Use the navigation menu to access different sections',
            'Only non-confidential documents are visible to clients',
            'Contact your attorney if you have questions about your case',
          ],
        };
      default:
        return {
          title: 'Information',
          description: message || 'No additional information available.',
          tips: [],
        };
    }
  };

  const { title, description, tips } = getHelpContent();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-blue-900">
            {title}
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>{description}</p>
            {tips.length > 0 && (
              <ul className="mt-3 space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {type === 'access-denied' && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    If you continue to experience access issues, please contact your law firm's support team.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientPortalHelp;