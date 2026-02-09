import { Toaster } from 'sonner';
import { SheetView } from '@/components/sheet/SheetView';

const App = () => (
  <>
    <Toaster position="bottom-right" richColors closeButton />
    <SheetView />
  </>
);

export default App;
