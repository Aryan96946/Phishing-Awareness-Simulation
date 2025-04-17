import { useEffect, useState } from 'react';

const DebugInfo = () => {
  const [renderInfo, setRenderInfo] = useState<string>('Component mounted');

  useEffect(() => {
    try {
      // Gather environment information
      const envInfo = {
        userAgent: navigator.userAgent,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString(),
      };
      
      setRenderInfo(JSON.stringify(envInfo, null, 2));
      
      // Log successful render to console
      console.log('Debug component rendered successfully', envInfo);
    } catch (error) {
      setRenderInfo(`Error: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Debug component error:', error);
    }
  }, []);

  return (
    <div className="fixed bottom-0 right-0 bg-black bg-opacity-80 text-white p-4 m-4 rounded-lg z-50 max-w-md text-xs font-mono overflow-auto max-h-48">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <pre>{renderInfo}</pre>
    </div>
  );
};

export default DebugInfo;