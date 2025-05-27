import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import React from 'react';

interface NavigationHeaderProps {
    currentPath: string[];
    handleNavigateUp: () => void;
    updatePath: (path: string[]) => void;
  }
  
  const NavigationHeader: React.FC<NavigationHeaderProps> = ({ currentPath, handleNavigateUp, updatePath }) => {
    return (
      <div className="flex items-center gap-2 p-2 border-b rounded-t-lg">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleNavigateUp}
          disabled={currentPath.length <= 1}
        >
          <ChevronLeft size={16} />
        </Button>
        <Breadcrumb>
          <BreadcrumbList>
            {currentPath.map((pathItem, index) => (
              <React.Fragment key={pathItem}>
                <BreadcrumbItem>
                  {index === currentPath.length - 1 ? (
                    <BreadcrumbPage>{pathItem}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      onClick={() => updatePath(currentPath.slice(0, index + 1))}
                      className="cursor-pointer"
                    >
                      {pathItem}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < currentPath.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    );
  };

  export default NavigationHeader;