import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { DownloadCloud, Video, Clock, ExternalLink, Loader2, ArrowLeft } from "lucide-react";
import { useGetUserHistory, useDownloadVideo } from "@/hooks/use-api";
import { useAuthStore } from "@/lib/auth";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { DownloadRecord } from "@workspace/api-client-react/src/generated/api.schemas";
import { useSEO } from "@/hooks/use-seo";

export default function Dashboard() {
  useSEO({
    title: "My Downloads – StreamFetch",
    description: "View and re-download your StreamFetch download history.",
    canonical: "/dashboard",
    noindex: true,
  });
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();
  const { data, isLoading, isError } = useGetUserHistory();
  const downloadMutation = useDownloadVideo();
  const { toast } = useToast();

  useEffect(() => {
    if (!user && !localStorage.getItem('sf_token')) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  const handleRedownload = async (record: DownloadRecord) => {
    try {
      const blob = await downloadMutation.mutateAsync({
        data: {
          url: record.videoUrl,
          formatId: record.selectedFormat,
          title: record.videoTitle
        }
      });
      
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const safeTitle = record.videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      // Assuming format strings often contain extension, else defaulting to mp4
      const ext = record.selectedFormat.includes('mp3') || record.selectedFormat.includes('audio') ? 'mp3' : 'mp4';
      a.download = `${safeTitle}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      
      toast({ title: "Redownload Started" });
    } catch (err: any) {
      toast({
        title: "Download Failed",
        description: err.message || "Could not re-download the file.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center p-4">
        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Failed to load history</h2>
        <p className="text-muted-foreground">Please try refreshing the page or logging in again.</p>
      </div>
    );
  }

  const downloads = data?.downloads || [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Your Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your past downloads and activity.</p>
        </div>
      </motion.div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
        {downloads.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-center px-4">
            <div className="w-20 h-20 rounded-full bg-secondary border border-white/5 flex items-center justify-center mb-6">
              <DownloadCloud className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No downloads yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Your download history will appear here once you start using StreamFetch.
            </p>
            <button 
              onClick={() => setLocation('/')}
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-colors"
            >
              Start Downloading
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-secondary/50">
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Video</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Format</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {downloads.map((record) => (
                  <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-10 sm:w-24 sm:h-14 rounded bg-black/50 overflow-hidden flex-shrink-0 relative">
                          {record.thumbnail ? (
                            <img src={record.thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Video className="w-5 h-5 text-muted-foreground absolute inset-0 m-auto" />
                          )}
                        </div>
                        <div className="min-w-0 max-w-[200px] sm:max-w-xs md:max-w-md">
                          <p className="text-sm font-semibold text-white truncate" title={record.videoTitle}>
                            {record.videoTitle}
                          </p>
                          <a 
                            href={record.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 truncate"
                          >
                            <ExternalLink className="w-3 h-3" /> Original Link
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-white border border-white/10">
                        {record.selectedFormat}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {format(new Date(record.createdAt), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleRedownload(record)}
                        disabled={downloadMutation.isPending}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                        title="Re-download"
                      >
                        {downloadMutation.isPending && downloadMutation.variables?.data.url === record.videoUrl ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <DownloadCloud className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
