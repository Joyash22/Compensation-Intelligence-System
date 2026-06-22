import { SubmitForm } from "@/components/SubmitForm";
import { CSVImport } from "@/components/CSVImport";

export default function SubmitPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Submit Salary Data</h1>
        <p className="text-sm text-gray-500 mt-1">
          All submissions are anonymous. Help others make informed decisions.
        </p>
      </div>
      <SubmitForm />
      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bulk Import via CSV</h2>
        <CSVImport />
      </div>
    </div>
  );
}
