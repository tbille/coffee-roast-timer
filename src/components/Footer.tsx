const Footer = () => {
  return (
    <footer className="border-t mt-auto py-6 px-4">
      <div className="container mx-auto text-center">
        <p className="text-sm text-muted-foreground">
          made with love by{" "}
          <a 
            href="https://bille.dev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            toto
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;