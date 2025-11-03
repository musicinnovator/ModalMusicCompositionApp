import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { 
  AlertTriangle, 
  Info, 
  AlertCircle, 
  XCircle, 
  Download, 
  Trash2, 
  RefreshCw,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ErrorStats {
  total: number;
  bySeverity: Record<string, number>;
  byCategory: Record<string, number>;
  recent: any[];
}

interface ErrorDebugPanelProps {
  getErrorStats: () => ErrorStats;
  clearHistory: () => void;
  exportErrorLog: () => string;
}

export function ErrorDebugPanel({ 
  getErrorStats, 
  clearHistory, 
  exportErrorLog 
}: ErrorDebugPanelProps) {
  const [stats, setStats] = useState<ErrorStats>(() => getErrorStats());
  const [selectedError, setSelectedError] = useState<any>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh stats
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setStats(getErrorStats());
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, getErrorStats]);

  const handleRefresh = () => {
    setStats(getErrorStats());
    toast.success('Error stats refreshed');
  };

  const handleClearHistory = () => {
    clearHistory();
    setStats(getErrorStats());
    setSelectedError(null);
    toast.success('Error history cleared');
  };

  const handleExportLog = () => {
    try {
      const log = exportErrorLog();
      const blob = new Blob([log], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `counterpoint-error-log-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Error log exported');
    } catch (error) {
      toast.error('Failed to export error log');
      console.error('Export error:', error);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Info className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-950/20';
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-950/20';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'low': return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`gap-1 ${autoRefresh ? 'bg-green-50 border-green-300' : ''}`}
          >
            <Clock className="w-3 h-3" />
            Auto: {autoRefresh ? 'On' : 'Off'}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportLog}
            className="gap-1"
            disabled={stats.total === 0}
          >
            <Download className="w-3 h-3" />
            Export
          </Button>
          <Button
            variant="outline"  
            size="sm"
            onClick={handleClearHistory}
            className="gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive"
            disabled={stats.total === 0}
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total Errors</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <TrendingUp className="w-5 h-5 text-gray-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Critical</p>
              <p className="text-2xl font-bold text-red-600">{stats.bySeverity.critical || 0}</p>
            </div>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">High Priority</p>
              <p className="text-2xl font-bold text-orange-600">{stats.bySeverity.high || 0}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Counterpoint</p>
              <p className="text-2xl font-bold text-purple-600">{stats.byCategory.counterpoint || 0}</p>
            </div>
            <AlertCircle className="w-5 h-5 text-purple-500" />
          </div>
        </Card>
      </div>

      {stats.total === 0 ? (
        <Card className="p-8 text-center">
          <Info className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
          <h3 className="text-lg font-medium mb-2 text-green-800 dark:text-green-200">
            No Errors Detected
          </h3>
          <p className="text-green-600 dark:text-green-400 text-sm">
            The application is running smoothly! Error monitoring is active and will catch any issues.
          </p>
        </Card>
      ) : (
        <>
          {/* Category Breakdown */}
          <Card className="p-4">
            <h4 className="font-medium mb-4">Error Categories</h4>
            <div className="space-y-3">
              {Object.entries(stats.byCategory).map(([category, count]) => {
                if (count === 0) return null;
                
                const percentage = (count / stats.total) * 100;
                const isExpanded = expandedCategories.has(category);
                
                return (
                  <div key={category}>
                    <Collapsible>
                      <CollapsibleTrigger 
                        className="flex items-center justify-between w-full hover:bg-muted/50 p-2 -m-2 rounded"
                        onClick={() => toggleCategory(category)}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          <span className="font-medium capitalize">{category.replace('_', ' ')}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 ml-7">
                        <Progress value={percentage} className="h-2" />
                        <div className="mt-2 text-sm text-muted-foreground">
                          {count} error{count !== 1 ? 's' : ''} in {category} category
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent Errors */}
          <Card className="p-4">
            <h4 className="font-medium mb-4">Recent Errors ({Math.min(stats.recent.length, 10)})</h4>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {stats.recent.slice(0, 10).map((error, index) => (
                  <div
                    key={error.id || index}
                    className={`p-3 rounded border cursor-pointer hover:bg-muted/50 ${
                      selectedError?.id === error.id ? 'ring-2 ring-blue-500' : ''
                    } ${getSeverityColor(error.severity)}`}
                    onClick={() => setSelectedError(selectedError?.id === error.id ? null : error)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        {getSeverityIcon(error.severity)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {error.category}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {error.severity}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium truncate">{error.message}</p>
                          {error.context?.technique && (
                            <p className="text-xs text-muted-foreground">
                              Technique: {error.context.technique}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground ml-2">
                        {formatTimestamp(error.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Error Details */}
          {selectedError && (
            <Card className="p-4">
              <h4 className="font-medium mb-4">Error Details</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Error ID</p>
                    <p className="text-sm text-muted-foreground font-mono">{selectedError.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Timestamp</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedError.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <Badge variant="outline">{selectedError.category}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Severity</p>
                    <div className="flex items-center gap-1">
                      {getSeverityIcon(selectedError.severity)}
                      <Badge variant="secondary">{selectedError.severity}</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-2">Message</p>
                  <p className="text-sm bg-muted p-2 rounded">{selectedError.message}</p>
                </div>

                {selectedError.suggestion && (
                  <div>
                    <p className="text-sm font-medium mb-2">Suggestion</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                      💡 {selectedError.suggestion}
                    </p>
                  </div>
                )}

                {selectedError.userAction && (
                  <div>
                    <p className="text-sm font-medium mb-2">Recommended Action</p>
                    <p className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 p-2 rounded">
                      🔧 {selectedError.userAction}
                    </p>
                  </div>
                )}

                {selectedError.context && Object.keys(selectedError.context).length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Context</p>
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(selectedError.context, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedError.stackTrace && (
                  <div>
                    <p className="text-sm font-medium mb-2">Stack Trace</p>
                    <ScrollArea className="h-32">
                      <pre className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        {selectedError.stackTrace}
                      </pre>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}